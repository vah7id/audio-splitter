from argparse import ArgumentParser
import os
import warnings
from pathlib import Path

import nnabla as nn
import numpy as np
from api.models import OutputFormat
from api.separators.util import download_and_verify
from billiard.pool import Pool
from nnabla.ext_utils import get_extension_context
from spleeter.audio.adapter import AudioAdapter
from tqdm import trange
from xumx.test import separate_args_dict

from api.util import output_format_to_ext, is_output_format_lossy


MODEL_URL = 'https://nnabla.org/pretrained-models/ai-research-code/x-umx/x-umx.h5'
MODEL_SHA1 = '6414e08527d37bd1d08130c4b87255830af819bf'

"""
This module reimplements part of X-UMX's source separation code from https://github.com/sony/ai-research-code/blob/master/x-umx/test.py which is under copyright by Sony Corporation under the terms of the MIT license.
"""

class XUMXSeparator:
    """Performs source separation using X-UMX API."""
    def __init__(self,
                 cpu_separation: bool,
                 output_format=OutputFormat.MP3_256.value,
                 softmask=False,
                 alpha=1.0,
                 iterations=1):
        """Default constructor.
        :param config: Separator config, defaults to None
        """
        self.model_file = 'x-umx.h5'
        self.model_dir = Path('pretrained_models')
        self.model_file_path = self.model_dir / self.model_file
        self.context = 'cpu' if cpu_separation else 'cudnn'
        self.softmask = softmask
        self.alpha = alpha
        self.iterations = iterations
        self.audio_bitrate = f'{output_format}k' if is_output_format_lossy(output_format) else None
        self.audio_format = output_format_to_ext(output_format)
        self.sample_rate = 44100
        self.residual_model = False
        self.audio_adapter = AudioAdapter.default()
        self.chunk_duration = 30

    def get_estimates(self, input_path: str):
        ctx = get_extension_context(self.context)
        nn.set_default_context(ctx)
        nn.set_auto_forward(True)

        audio, _ = self.audio_adapter.load(input_path,
                                           sample_rate=self.sample_rate)

        if audio.shape[1] > 2:
            warnings.warn('Channel count > 2! '
                          'Only the first two channels will be processed!')
            audio = audio[:, :2]

        if audio.shape[1] == 1:
            print('received mono file, so duplicate channels')
            audio = np.repeat(audio, 2, axis=1)

        # Split and separate sources using moving window protocol for each chunk of audio
        # chunk duration must be lower for machines with low memory
        chunk_size = self.sample_rate * self.chunk_duration
        if (audio.shape[0] % chunk_size) == 0:
            nchunks = (audio.shape[0] // chunk_size)
        else:
            nchunks = (audio.shape[0] // chunk_size) + 1

        estimates = {}

        separate_args = {
            'model': str(self.model_file_path),
            'umx_infer': False,
            'targets': ['bass', 'drums', 'vocals', 'other'],
            'softmask': self.softmask,
            'alpha': self.alpha,
            'residual_model': self.residual_model,
            'niter': self.iterations
        }

        print('Separating...')
        for chunk_idx in trange(nchunks):
            cur_chunk = audio[chunk_idx *
                              chunk_size:min((chunk_idx + 1) *
                                             chunk_size, audio.shape[0]), :]
            cur_estimates = separate_args_dict(cur_chunk, separate_args)
            if any(estimates) is False:
                estimates = cur_estimates
            else:
                for key in cur_estimates:
                    estimates[key] = np.concatenate(
                        (estimates[key], cur_estimates[key]), axis=0)
        return estimates

    def create_static_mix(self, parts, input_path: str, output_path: Path):
        download_and_verify(MODEL_URL, MODEL_SHA1, self.model_dir,
                            self.model_file_path)
        estimates = self.get_estimates(input_path)

        final_source = None

        for name, source in estimates.items():
            if not parts[name]:
                continue
            final_source = source if final_source is None else final_source + source

        print(f'Exporting to {output_path}...')
        self.audio_adapter.save(output_path, final_source, self.sample_rate,
                                self.audio_format, self.audio_bitrate)

    def separate_into_parts(self, input_path: str, output_path: Path):
        download_and_verify(MODEL_URL, MODEL_SHA1, self.model_dir,
                            self.model_file_path)
        estimates = self.get_estimates(input_path)

        # Export all sources in parallel
        pool = Pool()
        tasks = []
        output_path = Path(output_path)

        for name, estimate in estimates.items():
            filename = f'{name}.{self.audio_format}'
            print(f'Exporting {filename}...')
            task = pool.apply_async(
                self.audio_adapter.save,
                (output_path / filename, estimate, self.sample_rate,
                 self.audio_format, self.audio_bitrate))
            tasks.append(task)

        pool.close()
        pool.join()

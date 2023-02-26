import { Dropzone, IFileWithMeta, StatusValue } from '@jeffreyca/react-dropzone-uploader';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import axios from 'axios';
import he from 'he';
import * as React from 'react';
import { Alert, Button, Modal, Card } from 'react-bootstrap';
import { ALLOWED_EXTENSIONS } from '../../Constants';
import { SongData } from '../../models/SongData';
import { YouTubeLinkFetchStatus } from '../../models/YouTubeLinkFetchStatus';
import { YouTubeSearchResponse } from '../../models/YouTubeSearchResponse';
import { YouTubeVideo } from '../../models/YouTubeVideo';
import { getYouTubeLinkForId } from '../../Utils';
import CustomInput from './CustomInput';
import CustomPreview from './CustomPreview';
import './UploadModal.css';
import UploadModalForm from './UploadModalForm';
import { YouTubeForm } from './YouTubeForm';

const DEBOUNCE_MS = 400;

const ERROR_MAP = new Map([
  ['aborted', 'Operation aborted.'],
  ['rejected_file_type', 'File type not supported.'],
  ['rejected_max_files', 'Only one file is allowed.'],
  ['error_file_size', 'File exceeds size limit (30 MB).'],
  ['error_upload_params', 'Unknown error occurred.'],
]);

function isValidYouTubeLink(link: string): boolean {
  const re = /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9_-]+)/;
  return re.test(link);
}

interface Props {
  show: boolean;
  disabled: boolean;
  hide: () => void;
  refresh: () => void;
}

interface State {
  droppedFile: boolean;
  fetchStatus: YouTubeLinkFetchStatus;
  isUploading: boolean;
  detailsStep: boolean;
  isSubmitting: boolean;
  fileId: number;
  artist: string;
  title: string;
  disabledLimit: boolean;
  link?: string;
  query?: string;
  searchResponse?: YouTubeSearchResponse;
  errors: string[];
}

class UploadModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      disabledLimit: props.disabled,
      droppedFile: false,
      fetchStatus: YouTubeLinkFetchStatus.IDLE,
      isUploading: false,
      isSubmitting: false,
      detailsStep: false,
      fileId: -1,
      artist: '',
      title: '',
      errors: [],
    };
  }

  /**
   * Reset all non-error state fields
   */
  resetState = (): void => {
    this.setState({
      droppedFile: false,
      fetchStatus: YouTubeLinkFetchStatus.IDLE,
      isUploading: false,
      isSubmitting: false,
      detailsStep: false,
      fileId: -1,
      artist: '',
      title: '',
      link: undefined,
      query: undefined,
      searchResponse: undefined,
    });
  };

  /**
   * Reset errors
   */
  resetErrors = (): void => {
    this.setState({
      errors: [],
    });
  };

  resetFetchState = (): void => {
    this.setState({
      fetchStatus: YouTubeLinkFetchStatus.IDLE,
    });
  };

  /**
   * Make API request to delete SourceFile from DB and filesystem
   */
  deleteCurrentFile = (): void => {
    if (this.state.fileId !== -1) {
      axios.delete('/api/source-file/file/', { data: { id: this.state.fileId } });
    }
  };

  /**
   * Called when modal hidden without finishing
   */
  onHide = (): void => {
    this.deleteCurrentFile();
    this.props.hide();
  };

  /**
   * Called when modal finishes exit animation
   */
  onExited = (): void => {
    // Reset here so modal contents do not flicker during animation
    this.resetState();
    this.resetErrors();
  };

  /**
   * Called when back button is clicked.
   */
  onBack = (): void => {
    if (this.state.detailsStep) {
      this.setState({
        detailsStep: false,
      });
    }
  };

  /**
   * Called when primary button is clicked.
   */
  onNext = (): void => {
    const itemTable = document.querySelectorAll('.waveSurfer-el');
    if(itemTable.length >= 1) {
      this.setState({
        isSubmitting: false,
        disabledLimit: true,
        isUploading: false,
        errors: ['Oopss!! Sadly for now you only cabale to work on one project at the time! If you want to upload a new song you must first remove your previous (current) project from the dashboard and then try to upload a new song :)'],
      });
      this.resetFetchState();
      this.resetState();
    }  else {
    /*if (!this.state.detailsStep) {
     
      this.setState({
        detailsStep: true,
      });
    } else*/ if (this.state.droppedFile) {
      const song = {
        source_file: this.state.fileId,
        artist: 'artist',
        title: 'title',
      };
      // Make request to add Song
      this.setState({
        isSubmitting: true,
      });
      axios
        .post<SongData>('/api/source-track/file/', song)
        .then(({ data }) => {
          console.log(data)
          console.log('###22222222')
          localStorage.setItem('ids',[data.id])
          this.props.hide();
          this.props.refresh();
          this.resetErrors();
          
        })
        .catch(err => {
          this.setState({
            isSubmitting: false,
            errors: [err],
          });
        });
    } else if (this.state.link) {
      const details = {
        youtube_link: this.state.link,
        artist: this.state.artist,
        title: this.state.title,
      };
      this.setState({
        isSubmitting: true,
      });
      // Submit YouTube song
      axios
        .post('/api/source-track/youtube/', details)
        .then((data) => {
          console.log(data)
          console.log('###33333333')

          localStorage.setItem('ids',[data.song_id])
          this.props.hide();
          this.props.refresh();
          this.setState({
            isSubmitting: false,
            disabledLimit: true,
          });
        })
        .catch(({ response }) => {
          const { data } = response;
          this.setState({
            isSubmitting: false,
            errors: data.errors,
          });
        });
      }
    }
  };

  /**
   * Query backend YouTube search API for video search results.
   * @param query Query string
   */
  youtubeSearch = (query: string): void => {
    this.setState({
      fetchStatus: YouTubeLinkFetchStatus.IS_FETCHING,
    });

    axios
      .get<YouTubeSearchResponse>('/api/search/', {
        params: {
          query,
        },
      })
      .then(({ data }) => {
        this.setState({
          searchResponse: data,
          fetchStatus: YouTubeLinkFetchStatus.DONE,
        });
      })
      .catch(({ response }) => {
        const { data } = response;
        this.setState({
          errors: data.errors,
          fetchStatus: YouTubeLinkFetchStatus.ERROR,
        });
      });
  };

  /**
   * Debounced version of youtubeSearch.
   */
  youtubeSearchDebounced = AwesomeDebouncePromise(this.youtubeSearch, DEBOUNCE_MS);

  /**
   * Called when artist or title fields change.
   */
  onDetailFieldChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault();
    const { name, value } = event.target;

    if (name === 'artist' || name === 'title') {
      this.resetErrors();
      this.setState({ [name]: value } as any);
    }
  };

  /**
   * Called when value of YouTube search text field changes.
   */
  onYouTubeFieldChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault();
    
      const { name, value } = event.target;

      if (name !== 'link') {
        return;
      }
      this.resetErrors();

      if (!value) {
        // Clear state if input field was cleared
        this.resetFetchState();
        this.setState({
          link: undefined,
          query: undefined,
          searchResponse: undefined,
        });
      } else if (!isValidYouTubeLink(value)) {
        // User entered a search query
        this.setState({
          query: value,
        });
        this.youtubeSearchDebounced(value);
      } else {
        // User entered a valid YouTube link
        this.setState({
          fetchStatus: YouTubeLinkFetchStatus.IS_FETCHING,
          link: value,
        });

        const itemTable = document.querySelectorAll('.waveSurfer-el');
        if(itemTable.length >= 1) {
          this.setState({
            isSubmitting: false,
            disabledLimit: true,
            isUploading: false,
            errors: ['Oopss!! Sadly for now you only cabale to work on one project at the time! If you want to upload a new song you must first remove you previous project from the dashboard and then try to upload a new song :)'],
          });
          this.resetFetchState();
          this.resetState();
        }  else {

        axios
          .get('/api/source-file/youtube/', {
            params: {
              link: value,
            },
          })
          .then(({ data }) => {
            const { artist, title } = data;
            this.setState({
              fetchStatus: YouTubeLinkFetchStatus.DONE,
              artist: artist,
              title: title,
            });

            const details = {
              youtube_link: value,
              artist: artist,
              title: title,
            };
            this.setState({
              isSubmitting: true,
            });
            // Submit YouTube song
            axios
              .post('/api/source-track/youtube/', details)
              .then((data) => {
            console.log(data)
            console.log('###55555555')

            localStorage.setItem('ids',[data.data.song_id])

                this.props.hide();
                this.props.refresh();
                this.setState({
                  isSubmitting: false,
                  disabledLimit: true,
                });
              })
              .catch(({ response }) => {
                const { data } = response;
                this.setState({
                  isSubmitting: false,
                  errors: data.errors,
                });
              });

          })
          .catch(({ response }) => {
            const { data } = response;
            if (data.status === 'duplicate') {
              this.setState({
                fetchStatus: YouTubeLinkFetchStatus.ERROR,
              });
            } else {
              this.setState({
                errors: response.data.errors,
                fetchStatus: YouTubeLinkFetchStatus.ERROR,
              });
            }
          });
        }
      }
  };

  /**
   * Called when file upload status changes.
   */
  onFileUploadStatusChange = ({ meta, remove, xhr }: IFileWithMeta, status: StatusValue): void => {
    const aborted =
      status === 'aborted' ||
      status === 'rejected_file_type' ||
      status === 'rejected_max_files' ||
      status === 'error_file_size' ||
      status === 'error_validation' ||
      status === 'error_upload_params';

    if (aborted) {
      // Upload aborted, so reset state and show error message
      const getResult = ERROR_MAP.get(status);
      const errorMsg = getResult ? [getResult] : ([] as string[]);
      this.resetState();
      this.setState({ errors: errorMsg });
    } else if (status === 'error_upload') {
      // Error with upload, so show error message
      try {
        const responseObject = JSON.parse(xhr?.response);
        if (responseObject && responseObject['errors']) {
          this.setState({ errors: responseObject['errors'] });
        }
      } catch {
        this.setState({ errors: ['Unknown error.'] });
      }
    } else if (status === 'removed') {
      // File was removed
      this.deleteCurrentFile();
      this.resetState();
      this.resetErrors();
    } else if (status === 'preparing') {
      // File upload initiated
      const itemTable = document.querySelectorAll('.waveSurfer-el');
      if(itemTable.length >= 1) {
        this.setState({
          isSubmitting: false,
          disabledLimit: true,
          isUploading: false,
          errors: ['Oopss!! Sadly for now you only cabale to work on one project at the time! If you want to upload a new song you must first remove you previous project from the dashboard and then try to upload a new song :)'],
        });
        const edj = document.querySelector('.dzu-previewButton');
        setTimeout(() => {if(edj) {edj.click()}}, 3000)
        this.deleteCurrentFile();
        this.resetFetchState();
        this.resetState();
      }  else {
        this.resetErrors();
        this.setState({
          droppedFile: true,
          isUploading: true,
          link: undefined,
        });
      }
    } else if (status === 'done') {
      setTimeout(() => {
        const edj = document.querySelector('.dzu-previewButton');
        if(edj) {
          edj.click();
        }
      }, 4000)
      
      const itemTable = document.querySelectorAll('.waveSurfer-el');
      if(itemTable.length >= 1) {
        this.setState({
          isSubmitting: false,
          isUploading: false,
          errors: ['Oopss!! Sadly for now you only cabale to work on one project at the time! If you want to upload a new song you must first remove your previous project from the dashboard and then try to upload a new song :)'],
        });
        this.resetFetchState();
        this.resetState();
        this.deleteCurrentFile();
      }  else {
        
        // File upload completed successfully, get returned ID and metadata info
        const responseObject = JSON.parse(xhr?.response);
        if (responseObject['file_id']) {
          
          console.log(responseObject['file_id'])
         // localStorage.setItem('ids',[responseObject['file_id']])

          this.setState({
            isUploading: false,
            fileId: responseObject['file_id'],
            artist: meta.duration,
            title: meta.name,
            isSubmitting: true,
          });

          const song = {
            source_file: responseObject['file_id'],
            artist: meta.duration,
            title: meta.name,
          };


          axios
            .post<SongData>('/api/source-track/file/', song)
            .then(({ data }) => {
              console.log(data)
              localStorage.setItem('ids',data.id)
              console.log('-666666666666==================')
              this.setState({
                isSubmitting: false,
                disabledLimit: true,
                isUploading: false,
              });
              this.props.hide();
              this.props.refresh();
              this.resetErrors();
              this.resetState()
            })
            .catch(err => {
              this.setState({
                isSubmitting: false,
                errors: [err],
              });
            });
          }
      }
    }
  };

  /**
   * Called when search result is clicked.
   * @param video Video that was clicked
   */
  onSearchResultClick = (video: YouTubeVideo): void => {
    this.setState({
      artist: he.decode(video.parsed_artist),
      title: he.decode(video.parsed_title),
      link: getYouTubeLinkForId(video.id),
//      detailsStep: true,
    });

    const details = {
      youtube_link: getYouTubeLinkForId(video.id),
      artist: he.decode(video.parsed_artist),
      title: he.decode(video.parsed_title),
    };

    this.resetErrors();
    this.resetState();
    
    const itemTable = document.querySelectorAll('.waveSurfer-el');

    if(itemTable.length >= 1) {
      this.setState({
        isSubmitting: false,
        disabledLimit: true,
        isUploading: false,
        errors: ['Oopss!! Sadly for now you only cabale to work on one project at the time! If you want to upload a new song you must first remove you previous project from the dashboard and then try to upload a new song :)'],
      });
      this.resetFetchState();
      this.resetState();
    }  else {
      this.setState({
        isSubmitting: true,
      });

      // Submit YouTube song
      axios
        .post('/api/source-track/youtube/', details)
        .then((data) => {
          localStorage.setItem('ids',[data.data.song_id])
          this.props.hide();
          this.props.refresh();
          this.resetFetchState();
          console.log(data)
          console.log('###11111111111')
          this.setState({
            link: undefined,
            query: undefined,
            disabledLimit: true,
            isUploading: false,
            isSubmitting: false,
            searchResponse: undefined,
          });
        })
        .catch(({ response }) => {
          const { data } = response;
          this.setState({
            isSubmitting: false,
            errors: data.errors,
          });
        });
      }
  };

  render(): JSX.Element {
    const {
      droppedFile,
      fetchStatus,
      isUploading,
      isSubmitting,
      detailsStep,
      artist,
      title,
      link,
      query,
      searchResponse,
      errors,
    } = this.state;
    const { show } = this.props;
    const modalTitle = detailsStep ? 'Fill in the details' : 'Upload your audio file';
    const primaryText = detailsStep ? 'Finish' : 'Next';

    let buttonEnabled;
    if (!detailsStep) {
      if (droppedFile) {
        buttonEnabled = !isUploading;
      } else {
        buttonEnabled = errors.length === 0 && link && fetchStatus === YouTubeLinkFetchStatus.DONE;
      }
    } else {
      buttonEnabled = artist && title && !isSubmitting;
    }

    return (
        <Card
          bg={'light'}
          key={'upload'}
          text={'white'}
          style={{ width: '100%', float: 'left' }}
          className="mb-2"
        >
          <Card.Body>
          
          {detailsStep ? (
            <UploadModalForm artist={artist} title={title} handleChange={this.onDetailFieldChange} />
          ) : (
            <>
              <Dropzone
                maxFiles={1}
                multiple={false}
                accept={ALLOWED_EXTENSIONS.join(',')}
                onChangeStatus={this.onFileUploadStatusChange}
                getUploadParams={() => ({ url: '/api/source-file/file/' })}
                InputComponent={CustomInput}
                PreviewComponent={CustomPreview}
              />
              <hr className="hr-text" data-content="OR Via Youtube Link or Search Query" />
              <YouTubeForm
                fetchStatus={fetchStatus}
                disabled={false}
                value={query || link}
                searchResponse={searchResponse}
                handleChange={this.onYouTubeFieldChange}
                onSearchResultClick={this.onSearchResultClick}
                />
                {errors.length > 0 && (
            <Alert variant="danger">
              {errors.map((val, idx) => (
                <div key={idx}>{val}</div>
              ))}
            </Alert>
          )}
            </>
          )}
          </Card.Body>
        </Card>
       
    );
  }
}

export default UploadModal;

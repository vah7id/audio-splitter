import axios from 'axios';
import * as React from 'react';
import { Alert, Button, Nav, Breadcrumb } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { DynamicMix } from '../../models/DynamicMix';
import { SongData } from '../../models/SongData';
import {logoSrc} from '../../svg/logo.png';
import { StaticMix } from '../../models/StaticMix';
import HomeNavBar from '../Nav/HomeNavBar';
import DeleteDynamicMixModal from '../SongTable/Modal/DeleteDynamicMixModal';
import DeleteStaticMixModal from '../SongTable/Modal/DeleteStaticMixModal';
import DeleteTrackModal from '../SongTable/Modal/DeleteTrackModal';
import DynamicMixModal from '../SongTable/Modal/DynamicMixModal';
import StaticMixModal from '../SongTable/Modal/StaticMixModal';
import SongTable from '../SongTable/SongTable';
import UploadModal from '../Upload/UploadModal';
import AutoRefreshButton from './AutoRefreshButton';
import './Home.css';
import MusicPlayer from './MusicPlayer';
import { CloudUpload } from 'react-bootstrap-icons';

interface SeparationTask {
  srcId: string;
  id: string;
  status: string;
}

interface State {
  /**
   * Whether to show delete dynamic mix modal
   */
  showDeleteDynamicMixModal: boolean;
  /**
   * Whether to show delete static mix modal
   */
  showDeleteStaticMixModal: boolean;
  /**
   * Whether to show delete track modal
   */
  showDeleteTrackModal: boolean;
  /**
   * Whether to show mix modal
   */
  showDynamicMixModal: boolean;
  /**
   * Whether to show source separation modal
   */
  showStaticMixModal: boolean;
  /**
   * Whether to show upload modal
   */
  showUploadModal: boolean;
  /**
   * List of songs seen in the song table
   */
  songList: SongData[];
  /**
   * Current song, if it is a source song
   */
  currentSrcSong?: SongData;
  /**
   * Current song, if it is a static mix
   */
  currentStaticMix?: StaticMix;
  /**
   * Current source song displayed in modal
   */
  currentModalSrcSong?: SongData;
  /**
   * Current dynamic mix displayed in modal
   */
  currentModalDynamicMix?: DynamicMix;
  /**
   * Current static mix displayed in modal
   */
  currentModalStaticMix?: StaticMix;
  /**
   * Whether audio is playing
   */
  isPlaying: boolean;
  /**
   * The separation task that was just submitted
   */
  task?: SeparationTask;
  /**
   * List of IDs of expanded rows
   */
  expandedIds: string[];
  isUploadLimited: boolean;
}

/**
 * Home component where main functionality happens, consisting of the main nav bar
 * and the song table.
 */
class Home extends React.Component<RouteComponentProps, State> {
  taskInterval?: number;
  audioInstance: HTMLMediaElement | null;

  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      isUploadLimited: false,
      showDeleteDynamicMixModal: false,
      showDeleteStaticMixModal: false,
      showDeleteTrackModal: false,
      showDynamicMixModal: false,
      showStaticMixModal: false,
      showUploadModal: false,
      songList: [],
      currentSrcSong: undefined,
      currentStaticMix: undefined,
      currentModalSrcSong: undefined,
      currentModalDynamicMix: undefined,
      currentModalStaticMix: undefined,
      isPlaying: false,
      task: undefined,
      expandedIds: [],
    };
    this.audioInstance = null;
  }

  getAudioInstance = (instance: HTMLAudioElement): void => {
    instance.onvolumechange = null;
    this.audioInstance = instance;
  };

  onAudioPause = (): void => {
    this.setState({
      isPlaying: false,
    });
  };

  onAudioPlay = (): void => {
    this.setState({
      isPlaying: true,
    });
  };

  onSrcSongPauseClick = (): void => {
    this.setState({
      isPlaying: false,
    });

    (window as any).reactmusicplayer.onTogglePlay();
  };

  onSrcSongPlayClick = (song: SongData): void => {
    if (this.state.currentSrcSong && this.state.currentSrcSong.url === song.url) {
      this.setState({
        isPlaying: true,
      });
      (window as any).reactmusicplayer.onTogglePlay();
    } else {
      this.setState({
        currentSrcSong: song,
        currentStaticMix: undefined,
        isPlaying: true,
      });
    }
  };

  onStaticMixPauseClick = (): void => {
    this.setState({
      isPlaying: false,
    });
    (window as any).reactmusicplayer.onTogglePlay();
  };

  onStaticMixPlayClick = (staticMix: StaticMix): void => {
    if (this.state.currentStaticMix && this.state.currentStaticMix.url === staticMix.url) {
      this.setState({
        isPlaying: true,
      });
      (window as any).reactmusicplayer.onTogglePlay();
    } else {
      this.setState({
        currentSrcSong: undefined,
        currentStaticMix: staticMix,
        isPlaying: true,
      });
    }
  };

  onDynamicMixSubmit = (srcId: string, id: string): void => {
    this.setState({
      expandedIds: [...this.state.expandedIds, srcId],
    });

    // Open Mixer page in new tab
    const win = window.open(`/mixer/${id}`, '_blank');
    win?.focus();
    this.loadData();
  };

  onStaticMixSubmit = (srcId: string, id: string, status: string): void => {
    this.setState({
      task: {
        srcId,
        id,
        status,
      },
      expandedIds: [...this.state.expandedIds, srcId],
    });
    this.loadData();
    // Set task state to null after 5 seconds
    this.taskInterval = setInterval(() => {
      this.setState({
        task: undefined,
      });
    }, 5000);
  };

  /**
   * Called when single table row is expanded
   */
  onExpandRow = (row: SongData, isExpand: boolean): void => {
    if (isExpand) {
      // Row is expanded, add the row ID to expanded row ID list
      this.setState({
        expandedIds: [...this.state.expandedIds, row.id],
      });
    } else {
      // Row is collapsed, remove current row ID from list
      this.setState({
        expandedIds: this.state.expandedIds.filter(s => s !== row.id),
      });
    }
  };

  /**
   * Called when the expand-all button is pressed
   */
  onExpandAll = (isExpandAll: boolean, results: SongData[]): void => {
    if (isExpandAll) {
      // Update expanded row ID list to contain every row
      this.setState({
        expandedIds: results.map((i: SongData) => i.id),
      });
    } else {
      // Clear expanded row ID list
      this.setState({
        expandedIds: [],
      });
    }
  };

  onDeleteDynamicMixClick = (mix: DynamicMix): void => {
    this.setState({ showDeleteDynamicMixModal: true, currentModalDynamicMix: mix, isUploadLimited: false });
  };

  onDeleteStaticMixClick = (mix: StaticMix): void => {
    this.setState({ showDeleteStaticMixModal: true, currentModalStaticMix: mix, isUploadLimited: false });
  };

  onDeleteTrackClick = (song: SongData): void => {
    localStorage.setItem('ids','');
    this.setState({ showDeleteTrackModal: true, currentModalSrcSong: song , isUploadLimited: false});
  };

  onDynamicMixClick = (song: SongData): void => {
    this.setState({ showDynamicMixModal: true, currentModalSrcSong: song });
  };

  onStaticMixClick = (song: SongData): void => {
    this.setState({ showStaticMixModal: true, currentModalSrcSong: song });
  };

  onUploadClick = (): void => {
    this.setState({ showUploadModal: true });
  };

  handleDeleteDynamicMixModalHide = (): void => {
    this.setState({ showDeleteDynamicMixModal: false });
  };

  handleDeleteDynamicMixModalExited = (): void => {
    this.setState({ currentModalDynamicMix: undefined });
  };

  handleDeleteStaticMixModalHide = (): void => {
    this.setState({ showDeleteStaticMixModal: false });
  };

  handleDeleteStaticMixModalExited = (): void => {
    this.setState({ currentModalStaticMix: undefined });
  };

  handleDeleteTrackModalHide = (): void => {
    this.setState({ showDeleteTrackModal: false });
  };

  handleDeleteTrackModalExited = (): void => {
    this.setState({ currentModalSrcSong: undefined });
  };

  handleDynamicMixModalHide = (): void => {
    this.setState({ showDynamicMixModal: false });
  };

  handleDynamicMixModalExited = (): void => {
    this.setState({ currentModalSrcSong: undefined });
  };

  handleStaticMixModalHide = (): void => {
    this.setState({ showStaticMixModal: false });
  };

  handleStaticMixModalExited = (): void => {
    this.setState({ currentModalSrcSong: undefined });
  };

  handleUploadModalHide = (): void => {
    this.setState({ showUploadModal: false });
  };

  /**
   * Fetch song data from backend
   */
  loadData = async (): Promise<void> => {
    const ids = localStorage.getItem('ids');
      return axios
      .get<SongData[]>('/api/source-track/'+ids)
      .then(({ data }) => {
        if(ids && ids !== '') {
          this.setState({ songList: [data] });
        } else if (data) {
          this.setState({ songList: [] });
        }
      })
      .catch(error => {
        if(ids && ids !== '') {
          // SHOW ERROR MSG: Probably your file has been deleted due to our 24hr policy
          this.setState({ songList: [] });
        } else {
          this.setState({ songList: [] });
        }
        console.log('API errors:', error)
      });
  };

  componentDidMount(): void {
    this.loadData();
    setTimeout(() => {
      if(this.state.songList.lenth === 0) {
      //  this.setState({ isUploadLimited: false })
      } else {
       // this.setState({ isUploadLimited: true })
      }
    }, 2000);
  }

  componentWillUnmount(): void {
    clearInterval(this.taskInterval);
  }

  render(): JSX.Element {
    const {
      songList,
      showDeleteDynamicMixModal,
      showDeleteStaticMixModal,
      isUploadLimited,
      showDeleteTrackModal,
      showStaticMixModal,
      showDynamicMixModal,
      showUploadModal,
      currentSrcSong,
      currentStaticMix,
      currentModalSrcSong,
      currentModalDynamicMix,
      currentModalStaticMix,
      isPlaying,
      task,
      expandedIds,
    } = this.state;
    const currentSongUrl = currentSrcSong ? currentSrcSong.url : currentStaticMix ? currentStaticMix.url : undefined;

    return (
      <div>
        <div className="jumbotron jumbotron-fluid bg-transparent">
          <div className="container secondary-color" style={{maxWidth: '920px'}}>
            <div class style={{width: '100%', display: 'block', textAlign: 'center', marginBottom: '32px'}}>
              <img src={logoSrc} alt="mikrotakt logo" />
              <h2 className="display-5">Vocal Remover and Audio Splitter AI</h2>
              <p style={{maxWidth: '620px',margin: '0 auto 20px auto', fontSize: '1rem'}} className="lead">Separate vocal, accompaniment, bass, and/or drum components of any song using powerful AI algorithms and yes its FREE!!</p>
              <Nav className="justify-content-center" activeKey="/home">
                <Nav.Item>
                  <Nav.Link href="/">HOME</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="link-1">HOW IT WORKS?</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="link-2">DONATE</Nav.Link>
                </Nav.Item>
              </Nav>
            </div>
           
            {/*task && (
              <Alert variant="success">
                <span>
                  <a target="_blank" rel="noreferrer" href={`/api/mix/static/${task.id}`}>
                    {task.id}
                  </a>
                  : {task.status}
                </span>
              </Alert>
            )*/}

            <UploadModal disabled={false} show={showUploadModal} hide={this.handleUploadModalHide} refresh={this.loadData} />


            {songList.length > 0 && <div className="mb-3 refresher" style={{width: '100% !important'}}>
              <AutoRefreshButton period={10} onRefresh={this.loadData} />
            </div>}
            <SongTable
              data={songList}
              currentSongUrl={currentSongUrl}
              isPlaying={isPlaying}
              expandedIds={expandedIds}
              onExpandRow={this.onExpandRow}
              onExpandAll={this.onExpandAll}
              onDeleteDynamicMixClick={this.onDeleteDynamicMixClick}
              onDeleteStaticMixClick={this.onDeleteStaticMixClick}
              onDeleteTrackClick={this.onDeleteTrackClick}
              onDynamicMixClick={this.onDynamicMixClick}
              onStaticMixClick={this.onStaticMixClick}
              onStaticMixPauseClick={this.onStaticMixPauseClick}
              onStaticMixPlayClick={this.onStaticMixPlayClick}
              onSrcSongPauseClick={this.onSrcSongPauseClick}
              onSrcSongPlayClick={this.onSrcSongPlayClick}
            />

            <Breadcrumb style={{width: '100%', 
              float: 'left',
                padding: '0 0 10px 0px !important',
                marginTop: '150px',
                opacity: 0.6,
                fontSize: '13px',
                background: 'none'
              }}>
              <Breadcrumb.Item active href="/">Home</Breadcrumb.Item>
              <Breadcrumb.Item href="/">
                Terms & Conditions
              </Breadcrumb.Item>
              <Breadcrumb.Item href="/">Vocal Remover</Breadcrumb.Item>
              <Breadcrumb.Item href="/">Audio Splitter Tool</Breadcrumb.Item>
              <Breadcrumb.Item href="/">Send us feedback</Breadcrumb.Item>
              <Breadcrumb.Item href="/">Donate</Breadcrumb.Item>
            </Breadcrumb>

            <p style={{marginBottom: '40px',width: '100%', opacity: 0.3, textTransform: 'uppercase', fontSize: '12px', float: 'left'}}>Made with love in Amsterdam XXX . Copyright @2023 All Rights Reserved</p>

          </div>
        </div>
        <MusicPlayer
          getAudioInstance={this.getAudioInstance}
          songData={currentSrcSong}
          staticMix={currentStaticMix}
          onAudioPause={this.onAudioPause}
          onAudioPlay={this.onAudioPlay}
        />
        <DynamicMixModal
          show={showDynamicMixModal}
          hide={this.handleDynamicMixModalHide}
          exit={this.handleDynamicMixModalExited}
          submit={this.onDynamicMixSubmit}
          refresh={this.loadData}
          song={currentModalSrcSong}
        />
        <StaticMixModal
          show={showStaticMixModal}
          hide={this.handleStaticMixModalHide}
          exit={this.handleStaticMixModalExited}
          submit={this.onStaticMixSubmit}
          refresh={this.loadData}
          song={currentModalSrcSong}
        />
        <DeleteDynamicMixModal
          show={showDeleteDynamicMixModal}
          hide={this.handleDeleteDynamicMixModalHide}
          exit={this.handleDeleteDynamicMixModalExited}
          refresh={this.loadData}
          mix={currentModalDynamicMix}
        />
        <DeleteStaticMixModal
          show={showDeleteStaticMixModal}
          hide={this.handleDeleteStaticMixModalHide}
          exit={this.handleDeleteStaticMixModalExited}
          refresh={this.loadData}
          mix={currentModalStaticMix}
        />
        <DeleteTrackModal
          show={showDeleteTrackModal}
          hide={this.handleDeleteTrackModalHide}
          exit={this.handleDeleteTrackModalExited}
          refresh={this.loadData}
          song={currentModalSrcSong}
        />
      </div>
    );
  }
}

export default Home;

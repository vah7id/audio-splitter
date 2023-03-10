import axios from 'axios';
import * as React from 'react';
import { Alert, Badge, Container, Row, Spinner, Nav, Breadcrumb } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router';
import { DynamicMix } from '../../models/DynamicMix';
import { separatorLabelMap } from '../../models/Separator';
import PlainNavBar from '../Nav/PlainNavBar';
import CancelButton from './CancelButton';
import CancelTaskModal from './CancelTaskModal';
import DeleteButton from './DeleteButton';
import DeleteTaskModal from './DeleteTaskModal';
import MixerPlayer from './MixerPlayer';

interface MatchParams {
  mixId: string;
}

interface State {
  data?: DynamicMix;
  isAborted: boolean;
  isDeleting: boolean;
  isDeleted: boolean;
  isLoaded: boolean;
  showCancelTaskModal: boolean;
  showDeleteTaskModal: boolean;
  errors: string[];
}

/**
 * Component for playing dynamic mixes.
 */
class Mixer extends React.Component<RouteComponentProps<MatchParams>, State> {
  timeout?: number;

  constructor(props: RouteComponentProps<MatchParams>) {
    super(props);
    this.state = {
      data: undefined,
      isAborted: false,
      isDeleting: false,
      isDeleted: false,
      isLoaded: false,
      showCancelTaskModal: false,
      showDeleteTaskModal: false,
      errors: [],
    };
  }

  getMixId = (): string => {
    const {
      match: { params },
    } = this.props;
    const mixId = params.mixId;
    return mixId;
  };

  loadData = (): void => {
    const mixId = this.getMixId();
    axios
      .get<DynamicMix>(`/api/mix/dynamic/${mixId}/`)
      .then(async({ data }) => {
        if (data) {
          console.log(data);
          this.setState({ isLoaded: true, data: data });
          //document.title = `${data.title} - ${data.artist} · Layouts`;

          /*let WaveSurfer = (await import("wavesurfer.js")).default;
          const wavesurferInstance = WaveSurfer.create({
            container: '#waveform',
            waveColor: '#222222',
            progressColor: '#A8DBA8',
            backend: 'MediaElement',
          });
          wavesurferInstance.load('http://localhost'+data.url)*/
        }
        if (data.error) {
          this.setState({
            errors: [data.error],
          });
        }
        if (data.status === 'Queued' || data.status === 'In Progress') {
          this.timeout = setTimeout(() => this.loadData(), 5000);
        } else if (data.status === 'Done') {
          this.setState({ showCancelTaskModal: false });
        }
      })
      .catch(() => {
        this.setState({
          isLoaded: true,
          data: undefined,
          errors: [`Dynamic mix ${mixId} does not exist.`],
        });
      });
  };

  cancelTask = (): Promise<void> => {
    const mixId = this.getMixId();
    this.setState({
      isDeleting: true,
    });
    // Cancel dynamic mix task
    return axios
      .delete(`/api/mix/dynamic/${mixId}/`)
      .then(() => {
        this.setState({
          isDeleting: false,
          isAborted: true,
        });
        clearTimeout(this.timeout);
      })
      .catch(({ response }) => {
        const { data } = response;
        this.setState({
          isDeleting: false,
          errors: [data.error],
        });
      });
  };

  deleteTask = (): Promise<void> => {
    const mixId = this.getMixId();
    this.setState({
      isDeleting: true,
    });
    // Delete dynamic mix task
    return axios
      .delete(`/api/mix/dynamic/${mixId}/`)
      .then(() => {
        this.setState({
          isDeleting: false,
          isDeleted: true,
        });
        clearTimeout(this.timeout);
      })
      .catch(({ response }) => {
        const { data } = response;
        this.setState({
          isDeleting: false,
          errors: [data.error],
        });
      });
  };

  componentDidMount(): void {
    this.loadData();
  }

  componentWillUnmount(): void {
    clearInterval(this.timeout);
  }

  onCancelTaskClick = (): void => {
    this.setState({ showCancelTaskModal: true });
  };

  handleCancelTaskModalHide = (): void => {
    this.setState({ showCancelTaskModal: false });
  };

  onDeleteTaskClick = (): void => {
    this.setState({ showDeleteTaskModal: true });
  };

  handleDeleteTaskModalHide = (): void => {
    this.setState({ showDeleteTaskModal: false });
  };

  render(): JSX.Element | null {
    const { data, errors, isAborted, isDeleting, isDeleted, isLoaded, showCancelTaskModal, showDeleteTaskModal } =
      this.state;
    let alert = null;

    if (!isLoaded) {
      return null;
    }

    const isQueued = data && data.status === 'Queued';
    const isProcessing = data && data.status === 'In Progress';
    const isDone = data && data.status === 'Done';
    const isError = data && data.status === 'Error';

    if (isAborted) {
      // Dynamic mix task was aborted
      alert = <Alert variant="danger">Successfuly Aborted.</Alert>;
    } else if (isDeleted) {
      // Dynamic mix task was aborted
      alert = <Alert variant="danger">Successfuly Deleted. Go To Homepage to create a new project</Alert>;
    } else if (errors.length > 0) {
      // Some other error has occurred
      alert = (
        <Alert variant="danger">
          {errors.map((val, idx) => (
            <div key={idx}>{val}</div>
          ))}
        </Alert>
      );
    } else if (isQueued) {
      // Task is queued
      alert = (
        <Alert className="mt-3" variant="secondary">
          <Row className="align-items-center pl-2">
            <span>In queue </span>
            <Spinner className="ml-2" animation="border" size="sm" />
          </Row>
        </Alert>
      );
    } else if (isProcessing) {
      // Task is in progress
      alert = (
        <Alert className="mt-3" variant="warning">
          <Row className="align-items-center center pl-2">
            <span style={{width: '100%', textAlign: 'center'}}>PLEASE BE PATIENT, IT MIGHT TAKES UP TO 60 SEC DEPENDS ON YOUR FILE SIZE! PROCESSING MIX...</span>
            <Spinner className="ml-2" style={{display: 'block', margin: '0 auto'}} animation="border" size="sm" />
          </Row>
        </Alert>
      );
    }

    const extraBadges = !data
      ? null
      : data.extra_info.map((extra, idx) => (
          <Badge variant="light" key={idx}>
            {extra}
          </Badge>
        ));

    return (
      <div style={{ alignItems: 'center', alignContent: 'center', marginTop: '32px'}}>
        <Container style={{ alignItems: 'center', alignContent: 'center', marginTop: '24px'}}>
        <h2 className="display-5" style={{textAlign: 'center'}}>Vocal Remover and Audio Splitter AI</h2>
              <p style={{maxWidth: '620px',margin: '0 auto 20px auto', fontSize: '1rem', textAlign: 'center'}} className="lead">Separate vocal, accompaniment, bass, and/or drum components of any song using powerful AI algorithms and yes its FREE!!</p>
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

          {data ? (
            <div style={{
              padding: '30px 20px',
              background: '#eee',
              marginTop: '20px'
            }}>
              <h4 className="mt-3 center" style={{marginTop: '32px'}}>
                {data.title} - {data.artist}
              </h4>
              <h5 className="mt-1 center">
                <Badge variant="dark">{separatorLabelMap[data.separator]}</Badge>
                {extraBadges}
              </h5>
              <div id="waveform" style={{width: '100%', margin: '20px 0'}} />
            </div>
          ) : null}
          {alert}
          {(isQueued || isProcessing) && !(isAborted || isDeleted) && (
            <CancelButton disabled={isDeleting} onClick={this.onCancelTaskClick} />
          )}
          {isDone && !isDeleted && <MixerPlayer data={data} />}
          {(isDone || isError) && !(isAborted || isDeleted) && (
            <DeleteButton className="mt-4" disabled={isDeleting} onClick={this.onDeleteTaskClick} />
          )}

          <Breadcrumb style={{width: '100%', 
                opacity: 0.5,
                float: 'left',
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

            <p style={{marginBottom: '40px',width: '100%',float: 'left', opacity: 0.3, textTransform: 'uppercase', fontSize: '12px'}}>Made with love in Amsterdam XXX . Copyright @2023 All Rights Reserved</p>

        </Container>
        <CancelTaskModal
          show={showCancelTaskModal}
          hide={this.handleCancelTaskModalHide}
          isCancelling={isDeleting}
          submit={this.cancelTask}
        />
        <DeleteTaskModal
          show={showDeleteTaskModal}
          hide={this.handleDeleteTaskModalHide}
          isDeleting={isDeleting}
          submit={this.deleteTask}
        />
      </div>
    );
  }
}

export default Mixer;

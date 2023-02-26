import * as React from 'react';
import { Button } from 'react-bootstrap';
import { ArrowClockwise } from 'react-bootstrap-icons';

interface Props {
  period: number;
  onRefresh: () => Promise<void>;
}

interface State {
  isRefreshing: boolean;
  seconds: number;
}

/**
 * Refreshing actually takes very little time, causing the refresh button to briefly flicker.
 * This controls how long to delay a "fake" refresh.
 */
const fakeRefreshDuration = 250;

/**
 * Component for an auto-refresh button.
 */
class AutoRefreshButton extends React.Component<Props, State> {
  tickInterval?: number;

  constructor(props: Props) {
    super(props);
    this.state = {
      isRefreshing: false,
      seconds: props.period,
    };
  }

  /**
   * Function called once per tick (every second).
   */
  tick = async (): Promise<void> => {
    const { period } = this.props;
    const { isRefreshing, seconds } = this.state;

    if (isRefreshing) {
      return;
    }

    // Time for refresh
    if (seconds <= 0) {
      // Stop interval
      clearInterval(this.tickInterval);
      this.setState({
        isRefreshing: true,
      });
      // Invoke callback and wait for it to resolve
      await this.props.onRefresh();
      // Reset ticks
      this.setState({
        isRefreshing: false,
        seconds: period,
      });
      // Restart interval
      this.tickInterval = setInterval(this.tick, 1000);
    } else {
      // Decrement ticks
      this.setState({
        seconds: this.state.seconds - 1,
      });
    }
  };

  refreshNow = async (): Promise<void> => {
    const { period } = this.props;
    const { isRefreshing } = this.state;

    if (isRefreshing) {
      return;
    }

    // Stop interval
    clearInterval(this.tickInterval);
    this.setState({
      isRefreshing: true,
    });
    // Invoke callback and wait for it to resolve
    await this.props.onRefresh();
    // Make manual refresh appear longer...
    await new Promise(resolve => setTimeout(resolve, fakeRefreshDuration));
    // Reset ticks
    this.setState({
      isRefreshing: false,
      seconds: period,
    });
    // Restart interval
    this.tickInterval = setInterval(this.tick, 1000);
  };

  componentDidMount(): void {
    // Tick every second
    this.tickInterval = setInterval(this.tick, 1000);
  }

  componentWillUnmount(): void {
    clearInterval(this.tickInterval);
  }

  render(): JSX.Element {
    const { isRefreshing, seconds } = this.state;
    const appearRefreshing = isRefreshing || seconds <= 0;
    //const text = !appearRefreshing ? `Refreshing in ${seconds}` : 'Refreshing...';
    const text = !appearRefreshing ? `` : 'Refreshing...';

    return (
      <div style={{ display: 'flex', alignItems: 'center', alignContent: 'center' }}>
        <h6 className="ongoing">
        <svg style={{marginRight: '6px'}} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#666" class="bi bi-file-earmark-music" viewBox="0 0 16 16">
          <path d="M11 6.64a1 1 0 0 0-1.243-.97l-1 .25A1 1 0 0 0 8 6.89v4.306A2.572 2.572 0 0 0 7 11c-.5 0-.974.134-1.338.377-.36.24-.662.628-.662 1.123s.301.883.662 1.123c.364.243.839.377 1.338.377.5 0 .974-.134 1.338-.377.36-.24.662-.628.662-1.123V8.89l2-.5V6.64z"/>
          <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/>
        </svg> 
  Ongoing Project:</h6>
        <pre style={{ fontSize: 13, margin: 0 }}>{text}</pre>
        <Button
          variant="secondary"
          className="ml-3"
          size="sm"
          disabled={appearRefreshing}
          onClick={this.refreshNow}
          style={{ cursor: appearRefreshing ? 'progress' : 'pointer' }}>
          <ArrowClockwise />
        </Button>
      </div>
    );
  }
}

export default AutoRefreshButton;

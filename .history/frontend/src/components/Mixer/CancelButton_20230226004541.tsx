import * as React from 'react';
import { Button } from 'react-bootstrap';

interface Props {
  disabled: boolean;
  onClick: () => void;
}

/**
 * Component for the cancel dynamic mix task button.
 */
class CancelButton extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <Button style={{display: 'block', margin: '0 auto'}} className={`text-btn`} variant="danger" disabled={this.props.disabled} onClick={this.props.onClick}>
        Cancel
      </Button>
    );
  }
}

export default CancelButton;
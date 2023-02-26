import * as React from 'react';
import { Button } from 'react-bootstrap';

interface Props {
  className?: string;
  disabled: boolean;
  onClick: () => void;
}

/**
 * Component for the delete dynamic mix button.
 */
class DeleteButton extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <Button
        className={`text-btn ${this.props.className}`}
        variant="outline-danger"
        size="sm"
        style={{display: 'block', margin: '0 auto'}}
        disabled={this.props.disabled}
        onClick={this.props.onClick}>
        Delete All Processed Files
      </Button>
    );
  }
}

export default DeleteButton;

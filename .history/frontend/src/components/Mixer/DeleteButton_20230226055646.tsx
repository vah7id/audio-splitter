import * as React from 'react';
import { Button } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';

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
    return (<div style={{width: '100%', float: 'left'}}>
      <Button
        className={`text-btn ${this.props.className}`}
        variant="outline-danger"
        size="sm"
        style={{display: 'block', margin: '0 auto',padding: '20px 32px !important'}}
        disabled={this.props.disabled}
        onClick={this.props.onClick}>
    
         Delete All Processed Files
      </Button></div>
    );
  }
}

export default DeleteButton;

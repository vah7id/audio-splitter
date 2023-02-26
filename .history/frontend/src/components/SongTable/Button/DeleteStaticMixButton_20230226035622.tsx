import * as React from 'react';
import { Button } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';
import { StaticMix } from '../../../models/StaticMix';

interface Props {
  disabled?: boolean;
  mix: StaticMix;
  onClick: (song: StaticMix) => void;
}

/**
 * Delete static mix button component.
 */
class DeleteStaticMixButton extends React.Component<Props> {
  handleClick = (): void => {
    this.props.onClick(this.props.mix);
  };

  render(): JSX.Element {
    return (
      <Button
        variant="outline-danger"
        className="ml-2 btn-sm"
        style={{ whiteSpace: 'nowrap' }}
        title="Delete"
        size={"sm"}
        disabled={this.props.disabled}
        onClick={this.handleClick}>
        <Trash />
      </Button>
    );
  }
}

export default DeleteStaticMixButton;

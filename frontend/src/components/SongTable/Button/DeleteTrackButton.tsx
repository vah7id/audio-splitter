import * as React from 'react';
import { Button } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';
import { SongData } from '../../../models/SongData';

interface Props {
  disabled?: boolean;
  song: SongData;
  onClick: (song: SongData) => void;
}

/**
 * Delete track button component.
 */
class DeleteTrackButton extends React.Component<Props> {
  handleClick = (): void => {
    this.props.onClick(this.props.song);
  };

  render(): JSX.Element {
    return (
      <Button
        variant="outline-danger"
        className="ml-2 btn-sm"
        style={{ whiteSpace: 'nowrap', height: '42px', width: '45px' }}
        title="Delete"
        disabled={this.props.disabled}
        onClick={this.handleClick}>
        <Trash width={'1.3rem'} height={'1.3rem'} />
      </Button>
    );
  }
}

export default DeleteTrackButton;

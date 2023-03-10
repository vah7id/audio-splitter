import * as React from 'react';
import { Button } from 'react-bootstrap';

interface Props {
  className?: string;
  isSoloed: boolean;
  disabled: boolean;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}

/**
 * Solo button component.
 */
const SoloButton = (props: Props): JSX.Element => {
  const { isSoloed } = props;
  const variant = isSoloed ? 'white' : 'warning';

  return (
    <Button
      onClick={props.onClick}
      disabled={props.disabled}
      className={`p-1 ${props.className}`}
      variant={variant}
      size="lg"
      style={{ width: 38, height: 38 }}
      active={props.isSoloed}
      title="Solo track">
      S
    </Button>
  );
};

export default SoloButton;

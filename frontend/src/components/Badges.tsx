import * as React from 'react';
import { Badge } from 'react-bootstrap';
import AccomIcon from './Icons/Accom';
import BassIcon from './Icons/Bass';
import DrumIcon from './Icons/drum';
import PianoIcon from './Icons/Piano';
import VocalIcon from './Icons/Vocal';

interface BadgeProps {
  className?: string;
  faded?: boolean;
  title?: string;
}

export const OriginalBadge = (props: BadgeProps): JSX.Element => {
  const { title } = props;
  return (
    <Badge className="ml-2 mr-2" pill variant="primary" title={title}>
      ORIGINAL
    </Badge>
  );
};

export const AllBadge = (): JSX.Element => {
  return (
    <Badge pill variant="primary">
      All Splitted Layouts
    </Badge>
  );
};

export const VocalsBadge = (props: BadgeProps): JSX.Element => {
  const { faded, title } = props;
  return (
    <Badge pill className={props.className} variant={faded ? 'vocals-faded' : 'vocals'} title={title}>
      <VocalIcon /> 
      Vocals
    </Badge>
  );
};

export const AccompBadge = (props: BadgeProps): JSX.Element => {
  const { faded, title } = props;
  return (
    <Badge pill className={props.className} variant={faded ? 'accomp-faded' : 'accomp'} title={title}>
      <AccomIcon />  
       Accompaniment
    </Badge>
  );
};

export const AccompShortBadge = (props: BadgeProps): JSX.Element => {
  const { faded, title } = props;
  return (
    <Badge pill className={props.className} variant={faded ? 'accomp-faded' : 'accomp'} title={title}>
      <AccomIcon />   
       Accomp.
    </Badge>
  );
};

export const PianoBadge = (props: BadgeProps): JSX.Element => {
  const { faded, title } = props;
  return (
    <Badge pill className={props.className} variant={faded ? 'piano-faded' : 'piano'} title={title}>
      <PianoIcon /> 
      Piano
    </Badge>
  );
};

export const DrumsBadge = (props: BadgeProps): JSX.Element => {
  const { faded, title } = props;
  return (
    <Badge pill className={props.className} variant={faded ? 'drums-faded' : 'drums'} title={title}>
      <DrumIcon /> 
      Drums
    </Badge>
  );
};

export const BassBadge = (props: BadgeProps): JSX.Element => {
  const { faded, title } = props;
  return (
    <Badge pill className={props.className} variant={faded ? 'bass-faded' : 'bass'} title={title}>
      <BassIcon /> 
      Bass
    </Badge>
  );
};

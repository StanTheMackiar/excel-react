import { RefObject } from 'react';
import { ICell } from './cell/cell.types';

export interface ActionByKeyPressedParams {
  cell: ICell;
  keyCode: string;
  focus: boolean;
  saveChanges: VoidFunction;
  inputRef: RefObject<HTMLInputElement>;
  setInternalInput: (value: string) => void;
}

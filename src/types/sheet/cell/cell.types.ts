export interface ICell {
  positionY: number;
  id: string;
  letter: string;
  number: number;
  positionX: number;
  value: string;
  computedValue: string;
}

export type ICellSpecial = {
  value: number;
  name: string;
};

export type ISheet = ICell[][];

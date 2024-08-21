export interface ICell {
  col: number;
  id: string;
  letter: string;
  number: number;
  row: number;
  value: string;
}

export type ICellSpecial = {
  value: number;
  name: string;
};

export type ISheet = ICell[][];

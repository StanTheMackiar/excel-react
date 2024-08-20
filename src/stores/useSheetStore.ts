import { create } from 'zustand';
import { Cell } from '../types/cell';

interface State {
  rowsQty: number;
  colsQty: number;
  sheet: Cell[][];
}

interface Actions {
  setRowsQty: (value: number) => void;
  setColsQty: (value: number) => void;
  setSheet: (sheet: Cell[][]) => void;
  onChangeCell: (cell: Cell, value: string) => void;
}

export const defaultState: State = {
  rowsQty: 2,
  colsQty: 2,
  sheet: [],
};

export const useSheetStore = create<State & Actions>((set) => ({
  ...defaultState,

  setRowsQty: (value) => set({ rowsQty: value }),
  setColsQty: (value) => set({ colsQty: value }),
  setSheet: (cells) => set({ sheet: cells }),
  onChangeCell: (cell: Cell, value: string) =>
    set((state) => {
      const sheet = state.sheet.slice();

      const newSheet = sheet.map((row) => {
        const clonedRow = structuredClone(row);

        const rowIndexFound = clonedRow.findIndex((c) => c.name === cell.name);

        if (rowIndexFound != -1) {
          const targetRow = clonedRow[rowIndexFound];
          clonedRow[rowIndexFound] = {
            ...targetRow,
            value,
          };
        }

        return clonedRow;
      });

      return {
        sheet: newSheet,
      };
    }),
}));

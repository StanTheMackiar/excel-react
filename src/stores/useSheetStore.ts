import { create } from 'zustand';
import { adjustSheetSize, getSheet } from '../helpers/sheet/sheet.helper';
import { ICell } from '../types/cell';

const initialRowsQty = 16;
const initialColsQty = 8;

interface State {
  colsQty: number;
  isSelecting: boolean;
  rowsQty: number;
  selectedCells: Set<ICell>;
  sheet: ICell[][];
}

interface Actions {
  addCellsToSelection: (cell: ICell) => void;
  setIsSelecting: (value: boolean) => void;
  setSelectedCells: (cells: Set<ICell>) => void;
  clearSelectedCells: VoidFunction;
  setSheetState: (state: Partial<State>) => void;
}

export const defaultState: State = {
  colsQty: initialColsQty,
  isSelecting: false,
  rowsQty: initialRowsQty,
  selectedCells: new Set(),
  sheet: getSheet(initialRowsQty, initialColsQty),
};

export const useSheetStore = create<State & Actions>((set) => ({
  ...defaultState,

  clearSelectedCells: () => set({ selectedCells: new Set() }),
  setIsSelecting: (value) => set({ isSelecting: value }),
  setSelectedCells: (cells) => set({ selectedCells: cells }),
  addCellsToSelection: (newCell) =>
    set((state) => {
      const newSelectedCells = state.selectedCells.add(newCell);

      return { selectedCells: newSelectedCells };
    }),

  setSheetState: (newState) =>
    set((currentState) => {
      // Verificar si hay cambios en las propiedades
      const shouldUpdateRowsQty = newState.rowsQty !== undefined;
      const shouldUpdateColsQty = newState.colsQty !== undefined;
      const shouldUpdateSheet = newState.sheet !== undefined;
      const shouldUpdateSelectedCells = newState.selectedCells !== undefined;

      if (!shouldUpdateRowsQty && !shouldUpdateColsQty && !shouldUpdateSheet) {
        return currentState; // No hacer nada si no hay cambios
      }

      const updatedRowsQty = shouldUpdateRowsQty
        ? newState.rowsQty!
        : currentState.rowsQty;

      const updatedColsQty = shouldUpdateColsQty
        ? newState.colsQty!
        : currentState.colsQty;

      const updatedSheet = shouldUpdateSheet
        ? adjustSheetSize(updatedRowsQty, updatedColsQty, newState.sheet!)
        : shouldUpdateRowsQty || shouldUpdateColsQty
          ? adjustSheetSize(updatedRowsQty, updatedColsQty, currentState.sheet)
          : currentState.sheet;

      return {
        ...(shouldUpdateColsQty && { colsQty: updatedColsQty }),
        ...(shouldUpdateSelectedCells && {
          selectedCells: newState.selectedCells,
        }),
        ...(shouldUpdateRowsQty && { rowsQty: updatedRowsQty }),
        ...(updatedSheet && { sheet: updatedSheet }),
      };
    }),
}));

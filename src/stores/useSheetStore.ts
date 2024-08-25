import { RefObject } from 'react';
import { create } from 'zustand';
import { adjustSheetSize, getSheet } from '../helpers/sheet/sheet.helper';
import { ICell } from '../types/sheet/cell/cell.types';

const initialRowsQty = 16;
const initialColsQty = 8;

export type Direction = 'left' | 'up' | 'down' | 'right';
interface State {
  colsQty: number;
  isSelecting: boolean;
  rowsQty: number;
  remarkedCell: ICell | null;
  focusedCellInput: RefObject<HTMLInputElement> | null;
  selectedCells: Set<ICell>;
  sheet: ICell[][];
}

interface Actions {
  moveRemarkedCell: (direction: Direction) => void;
  addCellsToSelection: (cell: ICell) => void;
  setIsSelecting: (value: boolean) => void;
  setFocusedCellInput: (value: RefObject<HTMLInputElement> | null) => void;
  setSelectedCells: (cells: Set<ICell>) => void;
  updateCell: (cellId: string, updatedCell: Partial<Omit<ICell, 'id'>>) => void;
  unmarkSelectedCells: VoidFunction;
  setRemarkedCell: (cell: ICell | null) => void;
  setSheet: (
    state: Partial<Pick<State, 'colsQty' | 'rowsQty' | 'sheet'>>
  ) => void;
}

export const defaultState: State = {
  colsQty: initialColsQty,
  isSelecting: false,
  remarkedCell: null,
  rowsQty: initialRowsQty,
  focusedCellInput: null,
  selectedCells: new Set(),
  sheet: getSheet(initialRowsQty, initialColsQty),
};

export const useSheetStore = create<State & Actions>((set) => ({
  ...defaultState,

  setFocusedCellInput: (value) => set({ focusedCellInput: value }),

  updateCell: (cellId, updatedCell) =>
    set(({ sheet }) => ({
      sheet: sheet.map((row) =>
        row.map((sheetCell) =>
          sheetCell.id === cellId ? { ...sheetCell, ...updatedCell } : sheetCell
        )
      ),
    })),

  moveRemarkedCell: (direction) =>
    set(({ remarkedCell: focusedCell, focusedCellInput, sheet }) => {
      if (!focusedCell || focusedCellInput)
        return { remarkedCell: focusedCell };

      const coordsMap: Record<Direction, { x: number; y: number }> = {
        up: {
          x: focusedCell.positionX,
          y: focusedCell.positionY - 1,
        },
        down: {
          x: focusedCell.positionX,
          y: focusedCell.positionY + 1,
        },
        right: {
          x: focusedCell.positionX + 1,
          y: focusedCell.positionY,
        },
        left: {
          x: focusedCell.positionX - 1,
          y: focusedCell.positionY,
        },
      };
      const coords = coordsMap[direction];

      const newFocusedCell = sheet.flat().find((sheetCell) => {
        const positionX = Math.max(coords.x, 0);
        const positionY = Math.max(coords.y, 0);

        return (
          sheetCell.positionX === positionX && sheetCell.positionY === positionY
        );
      });

      if (!newFocusedCell) return { remarkedCell: focusedCell };

      return {
        remarkedCell: newFocusedCell,
        selectedCells: new Set([newFocusedCell]),
      };
    }),

  unmarkSelectedCells: () => set({ selectedCells: new Set() }),

  setIsSelecting: (value) => set({ isSelecting: value }),

  setRemarkedCell: (cell) => set({ remarkedCell: cell }),

  setSelectedCells: (cells) => set({ selectedCells: cells }),

  addCellsToSelection: (newCell) =>
    set((state) => {
      const newSelectedCells = state.selectedCells.add(newCell);

      return { selectedCells: newSelectedCells };
    }),

  setSheet: (newState) =>
    set((currentState) => {
      // Verificar si hay cambios en las propiedades
      const shouldUpdateRowsQty = newState.rowsQty !== undefined;
      const shouldUpdateColsQty = newState.colsQty !== undefined;
      const shouldUpdateSheet = newState.sheet !== undefined;

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
        ...(shouldUpdateRowsQty && { rowsQty: updatedRowsQty }),
        ...(updatedSheet && { sheet: updatedSheet }),
      };
    }),
}));

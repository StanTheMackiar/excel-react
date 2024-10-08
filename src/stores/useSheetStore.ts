import { RefObject } from 'react';
import { create } from 'zustand';
import KeyEnum from '../enum/key.enum';
import { computeCell } from '../helpers/sheet/cell/cell.helper';
import {
  adjustSheetSize,
  getCellByDirection,
  getSelectedCells,
  getSheet,
} from '../helpers/sheet/sheet.helper';
import {
  FunctionModeCell,
  ICell,
  SelectedCellState,
} from '../types/sheet/cell/cell.types';

const initialRowsQty = 16;
const initialColsQty = 8;

export type Direction = 'left' | 'up' | 'down' | 'right';
interface State {
  colsQty: number;
  isSelecting: boolean;
  rowsQty: number;
  remarkedCell: ICell | null;
  remarkedCellInputRef: RefObject<HTMLInputElement> | null;
  focusedCellInputRef: RefObject<HTMLInputElement> | null;
  functionMode: boolean;
  selectedCells: ICell[];
  latestSelectedCell: ICell | null;
  selectedCellsState: SelectedCellState[];
  functionModeCells: FunctionModeCell[];

  sheet: ICell[][];
  pressedKeys: KeyEnum[];
}

interface Actions {
  addCellsToSelection: (cell: ICell) => void;
  addPressedKey: (key: KeyEnum) => void;
  moveRemarkedCell: (direction: Direction) => void;
  removePressedKey: (key: KeyEnum) => void;
  setFocusedCellInputRef: (value: RefObject<HTMLInputElement> | null) => void;
  setRemarkedCellInputRef: (value: RefObject<HTMLInputElement> | null) => void;
  setIsSelecting: (value: boolean) => void;
  setRemarkedCell: (cell: ICell | null) => void;
  setPressedKeys: (keys: KeyEnum[]) => void;
  setSelectedCells: (cells: ICell[]) => void;
  setSelectedCellsState: (cells: SelectedCellState[]) => void;
  setFunctionModeCells: (cells: FunctionModeCell[]) => void;
  addSelectedCellState: (cell: SelectedCellState) => void;
  removeSelectedCellState: (cellId: string) => void;
  moveLatestSelectedCell: (direction: Direction) => void;
  recomputeSheet: () => void;
  setFunctionMode: (value: boolean) => void;
  setLatestSelectedCell: (cell: ICell | null) => void;
  selectCells: (startCell: ICell, currentCell: ICell) => void;
  unmarkSelectedCells: VoidFunction;
  updateCell: (cellId: string, updatedCell: Partial<Omit<ICell, 'id'>>) => void;
  updateCells: (cells: (Partial<ICell> & { id: string })[]) => void;
  setSheet: (
    state: Partial<Pick<State, 'colsQty' | 'rowsQty' | 'sheet'>>
  ) => void;
}

export const defaultState: State = {
  colsQty: initialColsQty,
  focusedCellInputRef: null,
  isSelecting: false,
  pressedKeys: [],
  remarkedCell: null,
  remarkedCellInputRef: null,
  functionModeCells: [],
  functionMode: false,
  rowsQty: initialRowsQty,
  selectedCells: [],
  selectedCellsState: [],
  latestSelectedCell: null,
  sheet: getSheet(initialRowsQty, initialColsQty),
};

export const useSheetStore = create<State & Actions>((set) => ({
  ...defaultState,

  addPressedKey: (key) =>
    set(({ pressedKeys }) => ({
      pressedKeys: [...new Set([...pressedKeys, key])],
    })),

  removePressedKey: (key) =>
    set(({ pressedKeys }) => ({
      pressedKeys: pressedKeys.filter((stateKey) => stateKey !== key),
    })),

  setFunctionMode: (value) => set({ functionMode: value }),

  setLatestSelectedCell: (cell) => set({ latestSelectedCell: cell }),

  setFocusedCellInputRef: (value) => set({ focusedCellInputRef: value }),

  setRemarkedCellInputRef: (value) => set({ remarkedCellInputRef: value }),

  setPressedKeys: (pressedKeys) => set({ pressedKeys }),

  setFunctionModeCells: (cells) => set({ functionModeCells: cells }),

  recomputeSheet: () =>
    set(({ sheet }) => {
      const newSheet = sheet.map((row) =>
        row.map((cell) => {
          const newCell = computeCell(cell, sheet);

          return newCell;
        })
      );

      return { sheet: newSheet };
    }),

  updateCells: (updatedCells) =>
    set(({ sheet, selectedCellsState }) => ({
      sheet: sheet.map((row) =>
        row.map((sheetCell) => {
          const cellFinded = updatedCells.find(
            (updatedCell) => updatedCell.id === sheetCell.id
          );

          if (cellFinded) {
            const cellState = selectedCellsState.find(
              (selectedCell) => selectedCell.cellId === cellFinded.id
            );

            if (cellState && typeof cellFinded.value !== 'undefined') {
              cellState.setValue(cellFinded.value);
            }

            return { ...sheetCell, ...cellFinded };
          } else return sheetCell;
        })
      ),
    })),

  updateCell: (cellId, updatedCell) =>
    set(({ sheet, selectedCellsState }) => {
      const cellState = selectedCellsState.find(
        (selectedCell) => selectedCell.cellId === cellId
      );

      if (cellState && typeof updatedCell.value !== 'undefined')
        cellState.setValue(updatedCell.value);

      return {
        sheet: sheet.map((row) =>
          row.map((sheetCell) =>
            sheetCell.id === cellId
              ? { ...sheetCell, ...updatedCell }
              : sheetCell
          )
        ),
      };
    }),

  moveRemarkedCell: (direction) =>
    set(
      ({ remarkedCell, sheet, remarkedCellInputRef, focusedCellInputRef }) => {
        if (!remarkedCell) return { remarkedCell };

        const newRemarkedCell = getCellByDirection(
          direction,
          remarkedCell,
          sheet
        );

        if (!newRemarkedCell) return { remarkedCell };

        focusedCellInputRef?.current?.blur();
        remarkedCellInputRef?.current?.blur();

        return {
          remarkedCell: newRemarkedCell,
          selectedCells: [newRemarkedCell],
        };
      }
    ),

  selectCells: (startCell, currentCell) =>
    set(({ sheet }) => {
      const newSelectedCells = getSelectedCells(startCell, currentCell, sheet);

      return {
        selectedCells: newSelectedCells,
      };
    }),

  moveLatestSelectedCell: (direction) =>
    set(({ latestSelectedCell, remarkedCell, sheet }) => {
      if (!remarkedCell) return {};

      const startCell = remarkedCell;
      const targetCell = latestSelectedCell ?? startCell;

      if (!targetCell || !startCell) return {};

      const newLatestSelectedCell = getCellByDirection(
        direction,
        targetCell,
        sheet
      );

      if (!newLatestSelectedCell) return {};

      const newSelectedCells = getSelectedCells(
        startCell,
        newLatestSelectedCell,
        sheet
      );

      return {
        latestSelectedCell: newLatestSelectedCell,
        selectedCells: newSelectedCells,
      };
    }),

  unmarkSelectedCells: () => set({ selectedCells: [] }),

  setSelectedCellsState: (cells) =>
    set({ selectedCellsState: [...new Set(cells)] }),

  setIsSelecting: (value) => set({ isSelecting: value }),

  setRemarkedCell: (cell) => set({ remarkedCell: cell }),

  setSelectedCells: (cells) => set({ selectedCells: [...new Set(cells)] }),

  addSelectedCellState: (newCellState) =>
    set((state) => {
      let newSelectedCellState: SelectedCellState[] =
        state.selectedCellsState.slice();

      const stateFinded = state.selectedCellsState.find(
        (state) => state.cellId === newCellState.cellId
      );

      if (!stateFinded) {
        newSelectedCellState.push(newCellState);
      } else {
        newSelectedCellState = newSelectedCellState.map((state) =>
          state.cellId === newCellState.cellId ? newCellState : state
        );
      }

      return {
        selectedCellsState: newSelectedCellState,
      };
    }),

  removeSelectedCellState: (cellId) =>
    set((state) => {
      const newSelectedCellState: SelectedCellState[] =
        state.selectedCellsState.filter(
          (cellState) => cellState.cellId !== cellId
        );

      return {
        selectedCellsState: [...new Set(newSelectedCellState)],
      };
    }),

  addCellsToSelection: (newCell) =>
    set((state) => {
      const newSelectedCells = [...state.selectedCells, newCell];

      return { selectedCells: [...new Set(newSelectedCells)] };
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

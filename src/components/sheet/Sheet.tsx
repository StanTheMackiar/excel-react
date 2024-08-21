import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import {
  getCellFromMouseEvent,
  getSheetLetters,
  getSheetNumbers,
} from '../../helpers/sheet/sheet.helper';
import { useSheetStore } from '../../stores/useSheetStore';
import { ICell, ICellSpecial } from '../../types/cell';

import clsx from 'clsx';
import './Sheet.css';
import { Cell } from './cells/Cell';

export const Sheet: FC = () => {
  const [sheet, setSheetState] = useSheetStore((state) => [
    state.sheet,
    state.setSheet,
  ]);
  const [rowsQty, colsQty] = useSheetStore(
    useShallow((state) => [state.rowsQty, state.colsQty])
  );

  const [startSelectionCell, setStartSelectionCell] = useState<ICell | null>(
    null
  );

  const [
    selectedCells,
    setSelectedCells,
    addCellsToSelection,
    isSelecting,
    setIsSelecting,
    clearSelectedCells,
  ] = useSheetStore((state) => [
    state.selectedCells,
    state.setSelectedCells,
    state.addCellsToSelection,
    state.isSelecting,
    state.setIsSelecting,
    state.clearSelectedCells,
  ]);

  const onBlurCell = (cell: ICell, value: string) => {
    const newSheet = sheet.map((row) =>
      row.map((c) => (c.id === cell.id ? { ...c, value } : c))
    );

    setSheetState({ sheet: newSheet });
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;

    const cell = getCellFromMouseEvent(e, sheet);

    if (!cell) {
      clearSelectedCells();

      return;
    }

    if (!isSelecting) {
      setIsSelecting(true);
      setSelectedCells(new Set([cell]));
      setStartSelectionCell(cell);

      return;
    }

    addCellsToSelection(cell);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isSelecting || !startSelectionCell) return;

    const startCell = startSelectionCell;
    const currentCell = getCellFromMouseEvent(e, sheet);

    if (!currentCell) return;

    const newSelectedCells = new Set<ICell>();

    const startRow = Math.min(startCell.row, currentCell.row);
    const endRow = Math.max(startCell.row, currentCell.row);
    const startCol = Math.min(startCell.col, currentCell.col);
    const endCol = Math.max(startCell.col, currentCell.col);

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const cell = sheet[row][col];
        newSelectedCells.add(cell);
      }
    }

    setSelectedCells(newSelectedCells);
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [handleMouseMove, handleMouseUp, handleMouseDown]);

  const sheetLetters = useMemo(() => getSheetLetters(colsQty), [colsQty]);
  const sheetNumbers = useMemo(() => getSheetNumbers(rowsQty), [rowsQty]);

  const onClickColumn = (col: ICellSpecial) => {
    const columnFound = sheet.flat().filter((cell) => cell.col === col.value);

    setSelectedCells(new Set(columnFound));
  };

  const onClickRow = (row: ICellSpecial) => {
    const rowFound = sheet.flat().filter((cell) => cell.row === row.value);

    setSelectedCells(new Set(rowFound));
  };

  const getColIsSelected = useCallback(
    (col: ICellSpecial): boolean => {
      const selectedCellsArray = Array.from(selectedCells);

      const someColSelected = selectedCellsArray.some(
        (selectedCell) => selectedCell.col === col.value
      );

      return someColSelected;
    },
    [sheet, selectedCells]
  );

  const getRowIsSelected = useCallback(
    (row: ICellSpecial): boolean => {
      const selectedCellsArray = Array.from(selectedCells);

      const someRowSelected = selectedCellsArray.some(
        (selectedCell) => selectedCell.row === row.value
      );

      return someRowSelected;
    },
    [sheet, selectedCells]
  );

  return (
    <table className="sheet">
      <thead className="sheet-head">
        <tr className="sheet-row">
          <th className="sheet-header-cell"></th>

          {sheetLetters.map((col) => (
            <th
              onClick={() => onClickColumn(col)}
              className={clsx({
                ['sheet-header-cell']: true,
                selected: getColIsSelected(col),
              })}
              key={col.name}
            >
              {col.name}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {sheet.map((row, i) => {
          const specialRow = sheetNumbers[i];

          return (
            <tr className="sheet-row" key={specialRow.value}>
              <td
                onClick={() => onClickRow(specialRow)}
                className={clsx({
                  ['sheet-header-cell']: true,
                  selected: getRowIsSelected(specialRow),
                })}
              >
                {specialRow.name}
              </td>

              {row.map((cell) => {
                return <Cell key={cell.id} cell={cell} onBlur={onBlurCell} />;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

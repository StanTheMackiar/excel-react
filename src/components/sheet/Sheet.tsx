import { FC, useEffect, useMemo } from 'react';

import { useShallow } from 'zustand/react/shallow';
import {
  getCellFromMouseEvent,
  getSheetLetters,
  getSheetNumbers,
} from '../../helpers/sheet/sheet.helper';
import { useSheetStore } from '../../stores/useSheetStore';
import { ICell } from '../../types/cell';

import './Sheet.css';
import { Cell } from './cells/Cell';

export const Sheet: FC = () => {
  const [sheet, setSheetState] = useSheetStore((state) => [
    state.sheet,
    state.setSheetState,
  ]);
  const [rowsQty, colsQty] = useSheetStore(
    useShallow((state) => [state.rowsQty, state.colsQty])
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
    const newSheet = sheet.map((row) => {
      return row.map((c) => (c.id === cell.id ? { ...c, value } : c));
    });

    setSheetState({ sheet: newSheet });
  };

  const handleMouseDown = (e: MouseEvent) => {
    const cell = getCellFromMouseEvent(e, sheet);

    if (!cell) {
      clearSelectedCells();

      return;
    }

    if (!isSelecting) {
      setIsSelecting(true);
      setSelectedCells(new Set([cell]));

      return;
    }

    addCellsToSelection(cell);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isSelecting) return;

    const cell = getCellFromMouseEvent(e, sheet);

    if (cell) addCellsToSelection(cell);
  };

  const handleMouseUp = () => {
    setIsSelecting(false);

    if (selectedCells.size <= 1) clearSelectedCells();
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

  return (
    <table className="sheet">
      <thead className="sheet-head">
        <tr className="sheet-row">
          <th className="sheet-header-cell"></th>

          {sheetLetters.map((name) => (
            <th className="sheet-header-cell" key={name}>
              {name}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {sheet.map((row, i) => (
          <tr className="sheet-row" key={row[0].id}>
            <td className="sheet-header-cell">{sheetNumbers[i]}</td>

            {row.map((cell) => {
              return <Cell key={cell.id} cell={cell} onBlur={onBlurCell} />;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

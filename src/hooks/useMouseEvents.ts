import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { getCellFromMouseEvent } from '../helpers/sheet/sheet.helper';
import { useSheetStore } from '../stores/useSheetStore';
import { ICell } from '../types/sheet/cell/cell.types';

export const useMouseEvents = () => {
  const [
    addCellsToSelection,
    functionMode,
    isSelecting,
    remarkedCell,
    selectCells,
    selectedCells,
    setIsSelecting,
    setLatestSelectedCell,
    setRemarkedCell,
    setSelectedCells,
    sheet,
    unmarkSelectedCells,
    selectedCellsState,
  ] = useSheetStore(
    useShallow((state) => [
      state.addCellsToSelection,
      state.functionMode,
      state.isSelecting,
      state.remarkedCell,
      state.selectCells,
      state.selectedCells,
      state.setIsSelecting,
      state.setLatestSelectedCell,
      state.setRemarkedCell,
      state.setSelectedCells,
      state.sheet,
      state.unmarkSelectedCells,
      state.selectedCellsState,
    ])
  );

  const [startSelectionCell, setStartSelectionCell] = useState<ICell | null>(
    null
  );

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;

    const cell = getCellFromMouseEvent(e, sheet);

    if (!cell) {
      setLatestSelectedCell(null);
      setRemarkedCell(null);
      unmarkSelectedCells();
      setIsSelecting(false);
      setStartSelectionCell(cell);

      return;
    }

    const isUniqueSelected = selectedCells.length === 1;

    const clickedRemarkedCell =
      isUniqueSelected && remarkedCell?.id === cell?.id;

    const allowGetCellRef =
      functionMode && remarkedCell && !clickedRemarkedCell;

    if (allowGetCellRef) {
      e.preventDefault();

      selectedCellsState.forEach((state) => {
        if (state.cellId === remarkedCell.id) {
          const newValue = state.value + cell.id;

          state.setValue(newValue);
        }
      });

      return;
    }

    if (clickedRemarkedCell) {
      setIsSelecting(true);

      return;
    }

    if (!isSelecting) {
      setIsSelecting(true);
      setRemarkedCell(cell);
      setSelectedCells([cell]);
      setLatestSelectedCell(null);
      setStartSelectionCell(cell);

      return;
    }

    addCellsToSelection(cell);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isSelecting || !startSelectionCell) return;

    const currentCell = getCellFromMouseEvent(e, sheet);

    if (currentCell) selectCells(startSelectionCell, currentCell);
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

  return {};
};

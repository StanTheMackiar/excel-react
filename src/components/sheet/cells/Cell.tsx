import clsx from 'clsx';
import {
  ChangeEvent,
  FC,
  FocusEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useSheetStore } from '../../../stores/useSheetStore';
import { ICell } from '../../../types/sheet/cell/cell.types';

interface Props {
  cell: ICell;
  saveChanges: (cell: ICell, value: string) => void;
}

export const Cell: FC<Props> = ({ cell, saveChanges }) => {
  const [
    selectedCells,
    addSelectedCellState,
    remarkedCell,
    setFocusedCellRef,
    removeSelectedCellState,
    setRemarkedCellRef,
    functionMode,
    setFunctionMode,
  ] = useSheetStore(
    useShallow((state) => [
      state.selectedCells,
      state.addSelectedCellState,
      state.remarkedCell,
      state.setFocusedCellInputRef,
      state.removeSelectedCellState,
      state.setRemarkedCellInputRef,
      state.functionMode,
      state.setFunctionMode,
    ])
  );

  const [value, setValue] = useState(cell.value);
  const [inputFocused, setInputFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const isFunctionMode = functionMode && inputFocused;

  const isSelected = useMemo(
    () => selectedCells.some((selectedCell) => selectedCell.id === cell.id),
    [selectedCells, cell]
  );

  const { isRemarked, isShadowed } = useMemo(() => {
    const isShadowed = selectedCells.length > 1 && isSelected;
    const isRemarked = remarkedCell?.id === cell.id;

    return {
      isShadowed,
      isRemarked,
    };
  }, [remarkedCell, isSelected, selectedCells, cell]);

  useEffect(() => {
    const enableFuncMode = value.startsWith('=') && inputFocused;

    setFunctionMode(enableFuncMode);

    return () => {
      setFunctionMode(false);
    };
  }, [value, inputFocused]);

  useEffect(() => {
    if (isSelected) {
      addSelectedCellState({
        cellId: cell.id,
        setValue: (value: string) => setValue(value),
        value,
      });
    } else {
      removeSelectedCellState(cell.id);
    }
  }, [isSelected, setValue, value]);

  useEffect(() => {
    if (isRemarked) setRemarkedCellRef(inputRef);
  }, [isRemarked, inputRef]);

  const handleBlur: FocusEventHandler<HTMLInputElement> = () => {
    inputRef.current?.blur();

    setFocusedCellRef(null);
    setInputFocused(false);
    setFunctionMode(false);
    saveChanges(cell, value);
  };

  const onDoubleClick = () => {
    inputRef.current?.focus();
  };

  const onFocus = () => {
    setFocusedCellRef(inputRef);
    setInputFocused(true);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <td
      onDoubleClick={onDoubleClick}
      id={`${cell.id}-cell`}
      className="sheet-cell"
      key={cell.id}
    >
      <input
        onBlur={handleBlur}
        onFocus={onFocus}
        ref={inputRef}
        id={`${cell.id}-cellinput`}
        onChange={onChange}
        className={clsx('sheet-input', {
          'cell-shadow': isShadowed,
          'cell-marked': isRemarked,
          'cell-function-mode': isFunctionMode,
          'disable-pointer-events': !inputFocused,
        })}
        type="text"
        value={inputFocused ? value : cell.computedValue}
      />
    </td>
  );
};

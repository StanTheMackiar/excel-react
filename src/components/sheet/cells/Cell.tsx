import clsx from 'clsx';
import { ChangeEvent, FC, useEffect, useMemo, useRef, useState } from 'react';
import KeyEnum from '../../../enum/key.enum';
import { useSheetStore } from '../../../stores/useSheetStore';
import {
  CellOnKeyDownParams,
  ICell,
} from '../../../types/sheet/cell/cell.types';

interface Props {
  cell: ICell;
  saveChanges: (cell: ICell, value: string) => void;
  onPressKeyFromCell: (params: CellOnKeyDownParams) => void;
}

export const Cell: FC<Props> = ({ cell, saveChanges, onPressKeyFromCell }) => {
  const [selectedCells, remarkedCell, setFocusedCellInput, addPressedKey, removePressedKey] = useSheetStore(
    (state) => [
      state.selectedCells,
      state.remarkedCell,
      state.setFocusedCellInput,
      state.addPressedKey,
      state.removePressedKey,
    ]
  );



  const [value, setValue] = useState(cell.value);
  const [inputFocused, setInputFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleBlur = () => {
    inputRef.current?.blur();

    setFocusedCellInput(null);
    setInputFocused(false);
    if (value !== cell.value) {
      saveChanges(cell, value);
    }
  };

  const { isRemarked, isShadow } = useMemo(() => {
    const isSelected = selectedCells.has(cell);
    const isShadow = selectedCells.size > 1 && isSelected;
    const isRemarked = remarkedCell?.id === cell.id;

    return {
      isShadow,
      isRemarked,
    };
  }, [remarkedCell, selectedCells, cell]);

  const handleKeyDown = (e: KeyboardEvent) => {
    addPressedKey(e.key as KeyEnum)

    onPressKeyFromCell({
      event: e,
      cell,
      inputFocused,
      inputRef,
      saveChanges: handleBlur,
      setInternalInput: setValue,
    });
  }
   

  const handleKeyUp = (e: KeyboardEvent) => {
    removePressedKey(e.key as KeyEnum)
  }

  useEffect(() => {
    const disableEvent = !inputFocused && !isRemarked;

    if (disableEvent) {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);

      return;
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp);
    }
  }, [inputFocused, isRemarked, handleKeyDown]);

  const onDoubleClick = () => {
    inputRef.current?.focus();
  };

  const onFocus = () => {
    setFocusedCellInput(inputRef);
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
          'cell-shadow': isShadow,
          'cell-marked': isRemarked,
          'disable-pointer-events': !inputFocused,
        })}
        type="text"
        value={inputFocused ? value : cell.computedValue}
      />
    </td>
  );
};

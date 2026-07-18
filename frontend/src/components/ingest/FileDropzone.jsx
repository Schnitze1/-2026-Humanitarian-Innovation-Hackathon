import { useRef, useState } from "react";
import {
  ACCEPTED_ACCEPT_ATTR,
  ACCEPTED_EXTENSIONS,
  isAcceptedUpload,
} from "../../api/client";

function FileDropzone({ disabled, onFileSelected, selectedFile }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return;

    if (fileList.length > 1) {
      setLocalError("Please upload only one file. Multiple source files are not supported for a single report.");
      return;
    }

    const file = fileList[0];
    if (!isAcceptedUpload(file)) {
      setLocalError(
        `Unsupported file type. Accepted: ${ACCEPTED_EXTENSIONS.join(", ")}`
      );
      return;
    }

    setLocalError(null);
    onFileSelected(file);
  };

  return (
    <div className="file-dropzone-wrap">
      <div
        className={`file-dropzone${dragging ? " is-dragging" : ""}${
          disabled ? " is-disabled" : ""
        }`}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (disabled) return;
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => {
          if (!disabled) inputRef.current?.click();
        }}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label="Upload source file"
      >
        <p className="file-dropzone__title">
          {selectedFile
            ? selectedFile.name
            : "Drag and drop a source file here"}
        </p>
        <p className="file-dropzone__hint">
          or click to browse · {ACCEPTED_EXTENSIONS.join(", ")} only
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_ACCEPT_ATTR}
          hidden
          disabled={disabled}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {localError ? <p className="field-error">{localError}</p> : null}
    </div>
  );
}

export default FileDropzone;

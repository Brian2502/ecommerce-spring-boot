
import { useRef, useState } from "react";
import {
    UploadCloud,
    Image as ImageIcon,
    Trash2,
    RefreshCw,
} from "lucide-react";

import { adminService } from "../services/adminService";
import "../styles/ImageUpload.css";

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

const MAX_SIZE = 5 * 1024 * 1024;

export default function ImageUpload({
                                        value,
                                        onChange,
                                        onUploadingChange,
                                        disabled = false,
                                    }) {
    const inputRef = useRef(null);
    const uploadingRef = useRef(false);

    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState("");
    const [failedUrl, setFailedUrl] = useState(null);

    const handleUpload = async (file) => {
        if (!file || uploadingRef.current || disabled) {
            return;
        }

        setError("");

        if (!ALLOWED_TYPES.includes(file.type)) {
            setError("Chỉ hỗ trợ JPG, PNG và WEBP.");
            return;
        }

        if (file.size > MAX_SIZE) {
            setError("Dung lượng ảnh không được vượt quá 5MB.");
            return;
        }

        try {
            uploadingRef.current = true;
            setUploading(true);
            onUploadingChange?.(true);
            setProgress(0);

            const result = await adminService.uploadImage(
                file,
                setProgress
            );

            setFailedUrl(null);
            onChange(result.imageUrl);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Không thể tải hình ảnh lên. Vui lòng thử lại."
            );
        } finally {
            uploadingRef.current = false;
            setUploading(false);
            onUploadingChange?.(false);
            setProgress(0);

            if (inputRef.current) {
                inputRef.current.value = "";
            }
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);

        if (!uploading && !disabled) {
            handleUpload(e.dataTransfer.files[0]);
        }
    };

    const selectFile = () => {
        if (!uploading && !disabled) {
            inputRef.current?.click();
        }
    };

    const removeImage = () => {
        onChange("");
        setFailedUrl(null);
        setError("");
    };

    return (
        <div className="uv-image-upload">
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                disabled={uploading || disabled}
                onChange={(e) => {
                    const file = e.target.files[0];
                    e.target.value = "";
                    handleUpload(file);
                }}
            />

            {error && (
                <div className="uv-alert uv-alert-error">
                    {error}
                </div>
            )}

            <div
                className={`uv-upload-zone ${
                    dragging ? "dragging" : ""
                }`}
                onDragOver={(e) => {
                    e.preventDefault();

                    if (!uploading && !disabled) {
                        setDragging(true);
                    }
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
            >
                {uploading ? (
                    <div className="uv-upload-progress">
                        <UploadCloud size={30} />

                        <strong>
                            {progress === 100
                                ? "Đang xử lý hình ảnh..."
                                : "Đang tải hình ảnh lên..."}
                        </strong>

                        <div className="uv-progress-track">
                            <div
                                className="uv-progress-bar"
                                style={{
                                    width: `${progress}%`,
                                }}
                            />
                        </div>

                        <span>{progress}%</span>
                    </div>
                ) : value && failedUrl !== value ? (
                    <img
                        src={value}
                        alt="Hình ảnh sản phẩm"
                        className="uv-upload-preview"
                        onError={() => setFailedUrl(value)}
                    />
                ) : (
                    <div className="uv-upload-placeholder">
                        {value ? (
                            <ImageIcon size={36} />
                        ) : (
                            <UploadCloud size={36} />
                        )}

                        <strong>
                            {value
                                ? "Không thể tải hình ảnh"
                                : "Kéo thả hình ảnh vào đây"}
                        </strong>

                        <span>
                            Hoặc chọn ảnh từ máy tính
                        </span>

                        <button
                            type="button"
                            className="uv-btn uv-btn-primary"
                            onClick={selectFile}
                            disabled={disabled}
                        >
                            Chọn hình ảnh
                        </button>

                        <small>
                            JPG, PNG, WEBP · Tối đa 5MB
                        </small>
                    </div>
                )}
            </div>

            {value && !uploading && (
                <div className="uv-upload-actions">
                    <button
                        type="button"
                        className="uv-btn uv-btn-secondary"
                        onClick={selectFile}
                        disabled={disabled}
                    >
                        <RefreshCw size={14} />
                        Thay ảnh
                    </button>

                    <button
                        type="button"
                        className="uv-btn uv-remove-image"
                        onClick={removeImage}
                        disabled={disabled}
                    >
                        <Trash2 size={14} />
                        Bỏ ảnh
                    </button>
                </div>
            )}

            <div className="uv-upload-divider">
                <span>hoặc nhập URL</span>
            </div>

            <div className="uv-field">
                <label htmlFor="product-image-url">
                    URL hình ảnh
                </label>

                <input
                    id="product-image-url"
                    value={value ?? ""}
                    maxLength={1000}
                    disabled={uploading || disabled}
                    placeholder="https://..."
                    onChange={(e) => {
                        setFailedUrl(null);
                        setError("");
                        onChange(e.target.value);
                    }}
                />
            </div>
        </div>
    );
}

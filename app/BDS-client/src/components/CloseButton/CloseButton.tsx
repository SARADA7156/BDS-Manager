type CloseButtonProps = {
    onClick: () => void;
}

export const CloseButton = ({ onClick }: CloseButtonProps) => {
    return (
        <div>
            <span className="close-btn material-symbols-outlined iconBtn" onClick={onClick} title="閉じる">close</span>
        </div>
    )
}
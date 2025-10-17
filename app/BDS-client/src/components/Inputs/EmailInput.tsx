type EmailInputProps = {
    isError: string | null;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}


export const EmailInput = ({onChange, isError}: EmailInputProps) => {

    return (
        <div className="d-grid">
            <label htmlFor='input-email'>GmailかiCloudのメールアドレスを入力 <span className="text-warning">※必須</span></label>
            <input
                id="input-email"
                type="email"
                onChange={onChange}
                className={isError ? 'inputError' : ''}
            />
            {isError && <p className="setting-error-msg">{isError}</p>}
        </div>
    );
}
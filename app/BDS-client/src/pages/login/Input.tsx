import { EmailInput } from "../../components/Inputs/EmailInput"

type InputProps = {
    isValid: null | boolean;
    isError: null | string;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleClick: (e: React.FormEvent<HTMLButtonElement>) => Promise<void>;
}

export const Input = ({ isValid, isError, handleChange, handleClick }: InputProps) => {
    return (
        <div>
            <h2 className='text-center'>サインイン</h2>
            <form className='bg-dark2 p-2 d-grid'>
                <EmailInput onChange={handleChange} isError={isError}/>
                <button className={`btn box-border mt-3 ${isValid ? 'active' : 'no-active'}`} onClick={handleClick}>サインイン</button>
            </form>
        </div>

    )
}
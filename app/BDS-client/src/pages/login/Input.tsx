import { Icon } from "../../components/Icon/Icon";
import { EmailInput } from "../../components/Inputs/EmailInput"

type InputProps = {
    isError: null | string;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleClick: (e: React.FormEvent<HTMLButtonElement>) => Promise<void>;
}

export const Input = ({ isError, handleChange, handleClick }: InputProps) => {
    return (
        <div className="h-100">
            <Icon vertical={true} />
            <h4 className="text-center mt-4">サインイン</h4>
            <form className='p-2 d-grid'>
                <EmailInput onChange={handleChange} isError={isError}/>
                <button className={`btn box-border mt-3`} onClick={handleClick}>サインイン</button>
            </form>
        </div>

    )
}
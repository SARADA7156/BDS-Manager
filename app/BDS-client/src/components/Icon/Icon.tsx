type IconProps = {
    vertical: boolean;
}

export const Icon = ({ vertical }: IconProps) => {
    return (
        <div className={`justify-content-center BDS-emblem ${vertical ? 'vertical d-grid' : 'd-flex'}`}>
            <img src="../../public/imgs/bedrock_icon.webp" alt="BDS Manager icon" className="bedrock"/>
            <h2 className="ms-2"><b>BDS</b> Manager</h2>
        </div>
    )
}
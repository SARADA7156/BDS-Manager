export const Disconnect = () => {
    return (
        <div className='text-danger user-select-none d-flex' title='サーバーとの通信が切断されました。'>
            <span className="material-symbols-outlined">wifi_off</span>
            <p className='ms-1'>切断</p>
        </div>
    )
}
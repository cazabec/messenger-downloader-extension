import React from 'react';

const Logo = () => <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    marginBottom: 10,
}}>
    <p style={{
        fontSize: 17,
        marginTop: 10,
        fontWeight: 700,
        background: "-webkit-linear-gradient(45deg, #1182ff 30%, #ff6769 90%)",
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    }}>
        messenger downloader
    </p>
</div>;

export default Logo;
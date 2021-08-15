import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Check from '@material-ui/icons/Check';


const LoadingButton = (props) => {
    const { loading, done, ...other } = props;

    if (done) {
        return (
            <Button  {...other} disabled>
                <Check color="primary" />
            </Button>
        );
    }
    else if (loading) {
        return (
            <Button  {...other}>
                <CircularProgress size={22} color="secondary" />
            </Button>
        );
    } else {
        return (
            <Button  {...other} />
        );
    }
}

LoadingButton.defaultProps = {
    loading: false,
    done: false,
};

LoadingButton.propTypes = {
    loading: PropTypes.bool,
    done: PropTypes.bool,
};

export default LoadingButton;
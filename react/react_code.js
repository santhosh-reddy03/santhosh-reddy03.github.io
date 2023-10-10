'use strict';

const e = React.createElement;

class LikeButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }

  render() {
    if (this.state.liked) {
      return 'You liked this.';
    }

    return e(
      'button',
      { onClick: () => this.setState({ liked: true }) },
      'Like'
    );
  }
}

const dummyElement = () => {
    return e('p', {} ,"experimental stuff rendered from react code, this is how react works behind the scenes");
}

const domContainer = document.querySelector('#root');
// ReactDOM.render(e(LikeButton), domContainer);
ReactDOM.render(e(dummyElement), domContainer);
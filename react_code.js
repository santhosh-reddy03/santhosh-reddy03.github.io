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
    return e('h1', {} ,"hello tony");
}

const domContainer = document.querySelector('#root');
// ReactDOM.render(e(LikeButton), domContainer);
ReactDOM.render(e(dummyElement), domContainer);
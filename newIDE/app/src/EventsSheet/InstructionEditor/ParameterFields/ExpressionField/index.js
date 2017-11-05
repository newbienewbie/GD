import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import TextField from 'material-ui/TextField';
import Popover, { PopoverAnimationVertical } from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Cursores from 'cursores';
import {
  enumerateExpressions,
  filterExpressions,
} from './EnumerateExpressions';

const styles = {
  input: {
    fontFamily: '"Lucida Console", Monaco, monospace',
  },
};

export default class ExpressionField extends Component {
  _field = null;
  _fieldElement = null;
  _inputElement = null;
  //TODO: Factor \s\+\-\/\*\:\[\]\(\)\,\.
  cursores = new Cursores(/(?:^|[\s\+\-\/\*\:\[\]\(\)\,\.])([^\s\+\-\/\*\:\[\]\(\)\,\.]+)/, /([^\s\+\-\/\*\:\[\]\(\)\,\.]*)/);
  state = {
    open: false,
    completions: [],
  };

  componentDidMount() {
    if (this._field) {
      this._fieldElement = ReactDOM.findDOMNode(this._field);
      this._inputElement = this._field.getInputNode();
    }

    this._allExpressions = enumerateExpressions('number').allExpressions;
  }

  focus() {
    if (this._field) this._field.focus();
  }

  _handleFocus = event => {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      focusTextField: true,
      open: true,
    });
  };

  _handleBlur = () => {
    this.setState({
      focusTextField: false,
      open: false,
    });
  };

  _handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };

  _handleChange = (e, text) => {
    this.setState({
      open: true,
    });

    if (this.props.onChange) this.props.onChange(text);
    this._updateCompletions();
  };

  _handleMenuMouseDown = event => {
    console.log('_handleMenuMouseDown');
    // Keep the TextField focused
    event.preventDefault();
  };

  _handleExpressionChosen = (event, child) => {
    console.log('_handleExpressionChosen');
    const index = parseInt(child.key, 10);
    console.log(index);
    console.log(this.state.completions);
    const enumeratedExpression = this.state.completions[index];
    console.log('enumeratedExpression', enumeratedExpression);
    if (!enumeratedExpression) return;

    if (!this._inputElement) return;
    const cursorPosition = this._inputElement.selectionStart;
    console.log(cursorPosition);
    const { value } = this.props;

    const newValue = this.cursores.replace(
      value,
      cursorPosition,
      enumeratedExpression.name
    );
    if (this.props.onChange) this.props.onChange(newValue);
    setTimeout(() => {
      if (this._field) this._field.focus();
      if (this._inputElement) this._inputElement.setSelectionRange(cursorPosition, cursorPosition);
    });
  };

  _updateCompletions = () => {
    console.log("UPDATECOMPLETIONS")
    if (!this._inputElement) return;
    const cursorPosition = this._inputElement.selectionStart;
    const { value } = this.props;

    const { prefix } = this.cursores.token(value, cursorPosition);
    this.setState({
      completions: filterExpressions(this._allExpressions, prefix),
    });
  };

  _renderCompletionMenuItems = () => {
    return this.state.completions.map((enumeratedExpression, index) => {
      return (
        <MenuItem
          primaryText={enumeratedExpression.name}
          key={index}
          value={enumeratedExpression}
        />
      );
    });
  };

  render() {
    const { parameterMetadata } = this.props;
    const description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    return (
      <div>
        <TextField
          value={this.props.value}
          floatingLabelText={description}
          inputStyle={styles.input}
          onChange={this._handleChange}
          ref={field => (this._field = field)}
          onFocus={this._handleFocus}
          onBlur={this._handleBlur}
          fullWidth
        />
        {this._fieldElement && (
          <Popover
            open={this.state.open}
            canAutoPosition={false}
            anchorEl={this._fieldElement}
            useLayerForClickAway={false}
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            targetOrigin={{ horizontal: 'left', vertical: 'top' }}
            onRequestClose={this._handleRequestClose}
            animation={PopoverAnimationVertical}
          >
            <Menu
              disableAutoFocus={this.state.focusTextField}
              onItemTouchTap={this._handleExpressionChosen}
              onMouseDown={this._handleMouseDown}
            >
              {this._renderCompletionMenuItems()}
            </Menu>
          </Popover>
        )}
      </div>
    );
  }
}

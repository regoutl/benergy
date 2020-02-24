var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import { tr } from "../../tr/tr.js";
import { quantityToHuman as valStr } from '../quantitytohuman.js';
import { pieChart } from '../charts.js';
import { stackedLineChart } from '../charts.js';
import OriginDetails from './help/origindetails.js';

export var ConsoDialog = function (_React$Component) {
    _inherits(ConsoDialog, _React$Component);

    /** @details props
    closeRequested => function
    detailsRequested => function. user request details
    */
    function ConsoDialog(props) {
        _classCallCheck(this, ConsoDialog);

        var _this = _possibleConstructorReturn(this, (ConsoDialog.__proto__ || Object.getPrototypeOf(ConsoDialog)).call(this, props));

        _this.click = _this.onClick.bind(_this);
        _this.key = _this.onKey.bind(_this);

        _this.me = React.createRef();
        _this.bOk = React.createRef();
        _this.pieChart = React.createRef();
        return _this;
    }

    _createClass(ConsoDialog, [{
        key: 'onClick',
        value: function onClick(e) {
            if ( /*this.me.current.contains(e.target) && */this.bOk.current != e.target) //the dialog was clicked
                return;

            this.props.closeRequested();
        }
    }, {
        key: 'onKey',
        value: function onKey(e) {
            if (e.key === "Escape") {
                this.props.closeRequested();
            }
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            //use a timeout, else the open click is catched by this event listener
            setTimeout(function () {
                return window.addEventListener("mousedown", _this2.click);
            }, 0);
            window.addEventListener("keydown", this.key);

            this.update();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            this.update();
        }
    }, {
        key: 'update',
        value: function update() {
            var lastYearConso = this.props.history[this.props.history.length - 1].consumedEnergy;

            var ctx = this.pieChart.current.getContext("2d");
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            ctx.translate(50, 50);

            pieChart(ctx, lastYearConso.origin, 'energy', { fontColor: 'white', legend: 'text' });

            ctx.translate(-50, -50);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            window.removeEventListener("mousedown", this.click);
            window.removeEventListener("keydown", this.key);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            return React.createElement(
                'div',
                {
                    className: 'dialog vLayout',
                    ref: this.me,
                    style: {
                        left: '100px',
                        top: 'calc(var(--status-bar-height) + 20px)' //60
                    }
                },
                React.createElement(
                    'h3',
                    null,
                    tr("Power origin in %d", '', this.props.history[this.props.history.length - 1].year)
                ),
                React.createElement('canvas', { ref: this.pieChart, width: '200', height: '110' }),
                React.createElement(
                    'div',
                    { className: 'hLayout' },
                    React.createElement(
                        'div',
                        { className: 'button white', ref: this.bOk, onClick: this.props.closeRequested },
                        tr("Ok")
                    ),
                    React.createElement(
                        'div',
                        { className: 'button white', onClick: function onClick() {
                                return _this3.props.detailsRequested(OriginDetails);
                            } },
                        tr('Details...')
                    )
                )
            );
        }
    }]);

    return ConsoDialog;
}(React.Component);
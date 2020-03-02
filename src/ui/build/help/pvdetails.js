var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import { tr } from '../../../tr.js';
import { PlotTile, MathTextTile, NumberEditOrShow } from './sharedtiles.js';
import { AppContext } from '../appcontext.js';

function Production(props) {

    var math = [React.createElement(
        'p',
        { key: '1' },
        'Production of a PV farm of area ',
        React.createElement('img', { src: 'res/symbols/shared/area.svg' }),
        ' is : '
    ), React.createElement('img', { key: '2', src: 'res/symbols/pv/production.svg', alt: 'Pv production eq' }), React.createElement(
        'ul',
        { key: '3' },
        [{ img: 'shared/radFlux', descr: 'is the maximal radiant flux (W/m2)' }, { img: 'shared/efficiency', descr: 'is the pannel efficiency at y0' }, { img: 'shared/capaFactT', descr: 'is the capacity factor at that hour' }, { img: 'shared/decline', descr: 'is the yearly efficiency decline' }, { img: 'shared/year', descr: 'is the current year' }, { img: 'shared/year0', descr: 'is the build year' }].map(function (i) {
            return React.createElement(
                'li',
                { key: i.img },
                React.createElement('img', { src: "res/symbols/" + i.img + ".svg", alt: i.descr }),
                ' ',
                tr(i.descr)
            );
        })
    )];

    var text = [React.createElement(
        'p',
        { key: 'introTxt' },
        tr('The production depends on :')
    ), React.createElement(
        'ul',
        { className: 'default', key: 'list' },
        ['The area', 'The amount of sun. ' + 'The amount of sun depends on the location (we call it \'radiant flux\') ' + 'and the time of the day/year (we call it \'Capacity factor\').', 'The panel efficiency. This decrease with time. '].map(function (i) {
            return React.createElement(
                'li',
                { key: i },
                tr(i)
            );
        })
    )];

    return React.createElement(MathTextTile, {
        title: 'Production',
        math: math,
        text: text
    });
}

function RadFlux(props) {
    return React.createElement(
        'div',
        null,
        React.createElement(
            'h4',
            null,
            tr('Radiant flux')
        ),
        React.createElement(
            'div',
            { className: 'hLayout' },
            React.createElement(
                'div',
                null,
                React.createElement('img', { src: 'res/symbols/pv/maxRadFlux.svg', alt: 'max rad flux eq' }),
                React.createElement(
                    'ul',
                    null,
                    React.createElement(
                        'li',
                        null,
                        React.createElement('img', { src: 'res/symbols/shared/avgCapaFact.svg', alt: 'avgCapaFact' }),
                        ' ',
                        tr('is the average capacity factor')
                    ),
                    React.createElement(
                        'li',
                        null,
                        React.createElement('img', { src: 'res/symbols/pv/avgGhi.svg', alt: 'average global hori irradiance' }),
                        ' ',
                        tr(' is the average Global Horizontal Irradiance')
                    )
                )
            ),
            React.createElement(
                'div',
                null,
                React.createElement(
                    'a',
                    { href: 'data/' + props.country + '/pv/globalHorisontalIrradiance.png' },
                    React.createElement('img', { src: 'data/' + props.country + '/pv/globalHorisontalIrradiance.png', alt: 'ghi be', width: '120' })
                ),
                React.createElement(
                    'p',
                    { className: 'pSource' },
                    'https://globalsolaratlas.info/'
                )
            )
        )
    );
}

function CapaFact(props) {
    return React.createElement(
        'div',
        null,
        React.createElement(
            'h4',
            null,
            tr('Capacity factor')
        ),
        React.createElement(
            'p',
            null,
            tr('Naturally, photovoltaic panels do not produce all day long. To model this, we use a hourly capacity factor for each hour of the year based on the history.')
        ),
        React.createElement(
            'a',
            { href: "data/" + props.country + "/pv/allBePvCapaFact.csv" },
            tr('Download the historic data')
        ),
        React.createElement(
            'p',
            { className: 'pSource' },
            'https://www.renewables.ninja/downloads'
        )
    );
}

var EffiDecl = function (_React$Component) {
    _inherits(EffiDecl, _React$Component);

    function EffiDecl() {
        _classCallCheck(this, EffiDecl);

        return _possibleConstructorReturn(this, (EffiDecl.__proto__ || Object.getPrototypeOf(EffiDecl)).apply(this, arguments));
    }

    _createClass(EffiDecl, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var props = this.props;
            var val = props.pv.efficiencyDecline25Years * 100;

            var shared = React.createElement(
                'p',
                { key: '1' },
                tr('The efficiency of a solar pannel declines with time. ' + 'This simulation assumes that, after 25 years, the panel is still '),
                React.createElement(NumberEditOrShow, {
                    value: val,
                    onChange: function onChange(v) {
                        props.pv.efficiencyDecline25Years = v / 100;
                        _this2.forceUpdate();
                    },
                    min: 0,
                    max: 100
                }),
                tr('% effective.')
            );

            var math = [shared, React.createElement(
                'p',
                { key: '2' },
                tr('The yearly efficiency decline is then simply :')
            ), React.createElement('img', { key: '3', src: 'res/symbols/pv/decl25Todecl.svg' }), React.createElement(
                'p',
                { key: '4', className: 'pSource' },
                React.createElement(
                    'a',
                    { href: 'https://news.energysage.com/sunpower-solar-panels-complete-review' },
                    'Sumpower'
                )
            )];

            var text = [shared];

            return React.createElement(MathTextTile, {
                title: 'Efficiency decline',
                math: math,
                text: text
            });
        }
    }]);

    return EffiDecl;
}(React.Component);

/** @brief this class provide a lot of explainations about pv
*/
/* accepted props
parameters : string. same format as parameters.json
*/


export default function PvDetails(props) {
    var pv = props.parameters.energies.pv;

    return React.createElement(
        'div',
        { className: 'detailContent' },
        React.createElement(
            'h3',
            null,
            tr('Solar panels')
        ),
        React.createElement(
            'p',
            null,
            tr('Solar pannels are devices that transform sun into electricity.')
        ),
        React.createElement(
            'div',
            { className: 'hWrapLayout' },
            React.createElement(Production, null),
            React.createElement(RadFlux, { country: props.parameters.countryCode }),
            React.createElement(PlotTile, {
                title: 'Efficiency evolution',
                caption: 'Proportion of sun power transformed into electric power.',
                plot: pv.efficiency
            }),
            React.createElement(PlotTile, {
                title: 'Build energy',
                caption: 'Solar pannel manufacturing requires some energy. ',
                plot: pv.build.energy,
                comment: 'We assume they are build in China'
            }),
            React.createElement(PlotTile, {
                title: 'Build cost',
                caption: 'Solar pannel manufacturing cost.',
                plot: pv.build.cost
            }),
            React.createElement(PlotTile, {
                title: 'Operation and maintenance costs',
                caption: 'Yearly cost per m2',
                plot: pv.perYear.cost
            }),
            React.createElement(CapaFact, { country: props.parameters.countryCode }),
            React.createElement(EffiDecl, { pv: pv })
        )
    );
}
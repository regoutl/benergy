var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import { tr } from '../../../tr/tr.js';
import ReactPlot from '../reactplot.js';

/** @brief this class provide a lot of explainations about pv
*/

var WindDetails = function (_React$Component) {
    _inherits(WindDetails, _React$Component);

    /* accepted props
    productionMeans = this.simu.cProd.productionMeans
    countries       = this.simu.cProd.countries
    closeRequested
    */
    function WindDetails(props) {
        _classCallCheck(this, WindDetails);

        return _possibleConstructorReturn(this, (WindDetails.__proto__ || Object.getPrototypeOf(WindDetails)).call(this, props));
    }

    _createClass(WindDetails, [{
        key: 'render',
        value: function render() {
            var wind = this.props.productionMeans.wind;

            var turbDensTxt = 'is turbin density. Const ' + (0.1 * Math.round(wind.density.at(2020) * 1e7) + ' turbine/km2');

            return React.createElement(
                'div',
                { className: 'detailContent' },
                React.createElement(
                    'h3',
                    null,
                    tr('Wind turbines (onshore @50m)')
                ),
                React.createElement(
                    'p',
                    null,
                    tr('Wind turbines are devices that transform wind kinetic energy into electricity.')
                ),
                React.createElement(
                    'div',
                    { className: 'hWrapLayout' },
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'h4',
                            null,
                            tr('Production')
                        ),
                        React.createElement(
                            'p',
                            null,
                            'Production of a wind farm of area ',
                            React.createElement('img', { src: 'data/symbols/area.svg' }),
                            ' is : '
                        ),
                        React.createElement('img', { src: 'data/wind/production.svg' }),
                        React.createElement(
                            'ul',
                            null,
                            [{ img: 'wind/turbDens', descr: turbDensTxt }, { img: 'wind/rotRad', descr: 'is the rotor radius. Const. 45m' }, { img: 'wind/wpd', descr: 'is the wind power density (W/m2)' }, { img: 'symbols/efficiency', descr: 'is the efficiency' }, { img: 'symbols/capaFactT', descr: 'is the capacity factor at hour t' }].map(function (i) {
                                return React.createElement(
                                    'li',
                                    { key: i.img },
                                    React.createElement('img', { src: "data/" + i.img + ".svg", alt: i.descr }),
                                    ' ',
                                    tr(i.descr)
                                );
                            })
                        )
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'h4',
                            null,
                            tr('Efficiency')
                        ),
                        React.createElement(
                            'p',
                            null,
                            tr('Proportion of wind energy transformed into electricity. ')
                        ),
                        React.createElement(ReactPlot, { data: wind.efficiency }),
                        React.createElement(
                            'p',
                            { className: 'pSource' },
                            wind.efficiency.source
                        )
                    ),
                    React.createElement(
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
                            tr('Naturally, wind turbines do not produce all day long. To model this, we use a hourly capacity factor for each hour of the year based on the history.')
                        ),
                        React.createElement(
                            'a',
                            { href: 'data/wind/wind_onshore_capaFact.csv' },
                            tr('Download the historic data for Belgium (2013-2017)')
                        ),
                        React.createElement(
                            'p',
                            { className: 'pSource' },
                            'https://www.renewables.ninja/downloads'
                        )
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'h4',
                            null,
                            tr('Wind power density')
                        ),
                        React.createElement(
                            'p',
                            null,
                            'The wind power density is the wind power flux. '
                        ),
                        React.createElement(
                            'a',
                            { href: 'data/wind/meanWindPowerDensity50.png', title: tr('Click to download') },
                            React.createElement('img', { src: 'data/wind/meanWindPowerDensity50.png', width: '300' })
                        ),
                        React.createElement(
                            'p',
                            { className: 'pSource' },
                            'https://globalwindatlas.info/'
                        )
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'h4',
                            null,
                            tr('Build cost')
                        ),
                        React.createElement(
                            'p',
                            null,
                            'Build cost per item'
                        ),
                        React.createElement(ReactPlot, { data: wind.build.cost }),
                        React.createElement(
                            'p',
                            { className: 'pSource' },
                            wind.build.cost.source
                        )
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'h4',
                            null,
                            tr('Maintenance cost')
                        ),
                        React.createElement(
                            'p',
                            null,
                            'Yearly cost per item'
                        ),
                        React.createElement(ReactPlot, { data: wind.perYear.cost }),
                        React.createElement(
                            'p',
                            { className: 'pSource' },
                            wind.perYear.cost.source
                        )
                    )
                )
            );
        }
    }]);

    return WindDetails;
}(React.Component);

export default WindDetails;
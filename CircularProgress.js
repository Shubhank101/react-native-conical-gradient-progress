import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, ViewPropTypes } from 'react-native';
import Svg, { Defs, Stop, G, Path, LinearGradient, Circle } from 'react-native-svg';
import { arc } from 'd3-shape';
import range from 'lodash/range';
import convert from 'color-convert';

function calculateStopColor(i, beginColor, endColor, segments) {
  return [
    Math.round(beginColor[0] + ((endColor[0] - beginColor[0]) * i) / segments),
    Math.round(beginColor[1] + ((endColor[1] - beginColor[1]) * i) / segments),
    Math.round(beginColor[2] + ((endColor[2] - beginColor[2]) * i) / segments),
  ];
}

const LINEAR_GRADIENT_PREFIX_ID = 'gradientRing';

export default class CircularProgress extends Component {
  static renderLinearGradients(state) {
    const { r1, beginColor, endColor, segments } = state;
    let startColor = beginColor;
    let stopColor = calculateStopColor(1, beginColor, endColor, segments);
    let startAngle = 0;
    let stopAngle = (2 * Math.PI) / segments;

    // since component is flipped horizontally, start is stop color and stop is start,
    // 12 is 1st for right , and 1 is last to the left
    return range(1, segments + 1).map(i => {
      if (i == 12) {
        startColor = [255, 146, 125];
        stopColor = [255, 142, 126]; // right start
      }
      if (i == 11) {
        startColor = [255, 160, 123];
        stopColor = [255, 146, 125]; // right start
      }
      if (i == 10) {
        startColor = [255, 170, 122];
        stopColor = [255, 160, 123]; // right start
      }
      if (i == 9) {
        startColor = [255, 183, 122];
        stopColor = [255, 170, 122]; // right start
      }
      if (i == 8) {
        startColor = [255, 198, 119];
        stopColor = [255, 183, 122]; // right start
      }
      if (i == 7) {
        startColor = [255, 208, 136];
        stopColor = [255, 198, 119]; // right start
      }
      if (i == 6) {
        startColor = [255, 198, 119];
        stopColor = [255, 208, 136]; // right start
      }
      if (i == 5) {
        startColor = [176, 194, 135];
        stopColor = [255, 198, 119]; // right start
      }
      if (i == 4) {
        startColor = [116, 191, 147];
        stopColor = [176, 194, 135]; // right start
      }
      if (i == 3) {
        startColor = [57, 188, 159];
        stopColor = [116, 191, 147]; // right start
      }
      if (i == 2) {
        startColor = [28, 186, 165];
        stopColor = [57, 188, 159]; // right start
      }
      if (i == 1) {
        startColor = [0, 186, 171];
        stopColor = [28, 186, 165]; // right start
      }
      const linearGradient = (
        <LinearGradient
          id={LINEAR_GRADIENT_PREFIX_ID + i}
          key={LINEAR_GRADIENT_PREFIX_ID + i}
          x1={r1 * Math.sin(startAngle)}
          y1={-r1 * Math.cos(startAngle)}
          x2={r1 * Math.sin(stopAngle)}
          y2={-r1 * Math.cos(stopAngle)}
        >
          <Stop offset="0" stopColor={'rgb(' + startColor.join(',') + ')'} />
          <Stop offset="1" stopColor={'rgb(' + stopColor.join(',') + ')'} />
        </LinearGradient>
      );
      startColor = stopColor;
      stopColor = calculateStopColor(i + 1, beginColor, endColor, segments);
      startAngle = stopAngle;
      stopAngle += (2 * Math.PI) / segments;

      return linearGradient;
    });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { width, size, beginColor, endColor, segments } = nextProps;
    let nextState = {};

    if (segments !== prevState.segments) {
      nextState.segments = segments;
    }

    if (width !== prevState.width || size !== prevState.size) {
      const r2 = size / 2;
      nextState = {
        ...nextState,
        r1: r2 - width,
        r2,
        width,
        size,
      };
    }

    if (beginColor !== prevState.beginColorCached || endColor !== prevState.endColorCached) {
      // CHANGE COLOR ORDER
      nextState = {
        ...nextState,
        beginColorCached: beginColor,
        endColorCached: endColor,
        beginColor: convert.hex.rgb(endColor),
        endColor: convert.hex.rgb(beginColor),
      };
    }

    const keys = Object.keys(nextState);

    if (keys.length) {
      const combinedState = { ...prevState, ...nextState };
      nextState.linearGradients = CircularProgress.renderLinearGradients(combinedState);
    }
    return keys.length ? nextState : null;
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  extractFill() {
    return Math.min(100, Math.max(0, this.props.fill));
  }

  renderBackgroundPath() {
    const { r1, r2 } = this.state;
    const { size, width, backgroundColor } = this.props;
    const backgroundPath = arc()
      .innerRadius(r1)
      .outerRadius(r2)
      .startAngle(0)
      .endAngle(2 * Math.PI);

    return <Path x={size / 2} y={size / 2} d={backgroundPath()} fill={backgroundColor} />;
  }

  renderCirclePaths() {
    const { r1, r2, segments } = this.state;
    const { size, width, beginColor } = this.props;
    const fill = this.extractFill();

    let numberOfPathsToDraw = Math.floor((2 * Math.PI * (fill / 100)) / ((2 * Math.PI) / segments));
    let rem = ((2 * Math.PI * (fill / 100)) / ((2 * Math.PI) / segments)) % 1;
    if (rem > 0) {
      numberOfPathsToDraw++;
    }
    let startAngle = 0;
    let stopAngle = -(2 * Math.PI) / segments;

    return [
      <Circle key="start_circle" cx={size / 2} cy={width / 2} r={width / 2} fill={beginColor} />,
      ...range(1, numberOfPathsToDraw + 1).map(i => {
        if (i === numberOfPathsToDraw && rem) {
          stopAngle = -2 * Math.PI * (fill / 100);
        }
        const circlePath = arc()
          .innerRadius(r1)
          .outerRadius(r2)
          .startAngle(startAngle)
          .endAngle(stopAngle - 0.005);

        const path = (
          <Path
            x={this.props.size / 2}
            y={this.props.size / 2}
            key={fill + i}
            d={circlePath()}
            fill={'url(#' + LINEAR_GRADIENT_PREFIX_ID + (segments - i + 1) + ')'}
          />
        );
        startAngle = stopAngle;
        stopAngle -= (2 * Math.PI) / segments;

        return path;
      }),
      <Circle
        key="end_circle"
        cx={(r2 - (r2 - r1) / 2) * Math.sin(2 * Math.PI * (fill / 100) - Math.PI) + size / 2}
        cy={(r2 - (r2 - r1) / 2) * Math.cos(2 * Math.PI * (fill / 100) - Math.PI) + size / 2}
        r={width / 2}
        fill={
          'transparent'
        }
      />,
    ];
  }

  render() {
    const { size, rotation, style, children } = this.props;
    const { linearGradients } = this.state;
    const fill = this.extractFill();

    return (
      <View style={style}>
        <Svg width={size} height={size} scale="1, -1" originX={size / 2}>
          <Defs key="linear_gradients">{linearGradients}</Defs>
          <G rotate={rotation - 90}>
            {this.renderBackgroundPath()}
            {this.renderCirclePaths()}
          </G>
        </Svg>
        {children && children(fill)}
      </View>
    );
  }
}

CircularProgress.propTypes = {
  backgroundColor: PropTypes.string,
  children: PropTypes.func,
  fill: PropTypes.number.isRequired,
  rotation: PropTypes.number,
  size: PropTypes.number.isRequired,
  style: ViewPropTypes.style,
  tintColor: PropTypes.string,
  width: PropTypes.number.isRequired,
  linecap: PropTypes.string,
};

CircularProgress.defaultProps = {
  tintColor: 'black',
  backgroundColor: '#e4e4e4',
  rotation: 90,
  linecap: 'butt',
};

import * as React from 'react';
import RightOutlined from '@ant-design/icons/RightOutlined';
import classNames from 'classnames';
import type { CollapseProps as RcCollapseProps } from 'rc-collapse';
import RcCollapse from 'rc-collapse';
import type { CSSMotionProps } from 'rc-motion';
import toArray from 'rc-util/lib/Children/toArray';
import omit from 'rc-util/lib/omit';

import initCollapseMotion from '../_util/motion';
import { cloneElement } from '../_util/reactNode';
import { devUseWarning } from '../_util/warning';
import { useComponentConfig } from '../config-provider/context';
import useSize from '../config-provider/hooks/useSize';
import type { SizeType } from '../config-provider/SizeContext';
import type { CollapsibleType } from './CollapsePanel';
import CollapsePanel from './CollapsePanel';
import useStyle from './style';

/** @deprecated Please use `start` | `end` instead */
type ExpandIconPositionLegacy = 'left' | 'right';
export type ExpandIconPosition = 'start' | 'end' | ExpandIconPositionLegacy | undefined;

export interface CollapseProps extends Pick<RcCollapseProps, 'items'> {
  activeKey?: Array<string | number> | string | number;
  defaultActiveKey?: Array<string | number> | string | number;
  /** 手风琴效果 */
  accordion?: boolean;
  /** @deprecated Please use `destroyOnHidden` instead */
  destroyInactivePanel?: boolean;
  /**
   * @since 5.25.0
   */
  destroyOnHidden?: boolean;
  onChange?: (key: string[]) => void;
  style?: React.CSSProperties;
  className?: string;
  rootClassName?: string;
  bordered?: boolean;
  prefixCls?: string;
  expandIcon?: (panelProps: PanelProps) => React.ReactNode;
  expandIconPosition?: ExpandIconPosition;
  ghost?: boolean;
  size?: SizeType;
  collapsible?: CollapsibleType;
  /**
   * @deprecated use `items` instead
   */
  children?: React.ReactNode;
}

interface PanelProps {
  isActive?: boolean;
  header?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  showArrow?: boolean;
  forceRender?: boolean;
  /** @deprecated Use `collapsible="disabled"` instead */
  disabled?: boolean;
  extra?: React.ReactNode;
  collapsible?: CollapsibleType;
}

const Collapse = React.forwardRef<HTMLDivElement, CollapseProps>((props, ref) => {
  const {
    getPrefixCls,
    direction,
    expandIcon: contextExpandIcon,
    className: contextClassName,
    style: contextStyle,
  } = useComponentConfig('collapse');

  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    style,
    bordered = true,
    ghost,
    size: customizeSize,
    expandIconPosition = 'start',
    children,
    destroyInactivePanel,
    destroyOnHidden,
    expandIcon,
  } = props;

  const mergedSize = useSize((ctx) => customizeSize ?? ctx ?? 'middle');
  const prefixCls = getPrefixCls('collapse', customizePrefixCls);
  const rootPrefixCls = getPrefixCls();
  const [wrapCSSVar, hashId, cssVarCls] = useStyle(prefixCls);

  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Collapse');

    // Warning if use legacy type `expandIconPosition`
    warning(
      expandIconPosition !== 'left' && expandIconPosition !== 'right',
      'deprecated',
      '`expandIconPosition` with `left` or `right` is deprecated. Please use `start` or `end` instead.',
    );
    warning.deprecated(
      !('destroyInactivePanel' in props),
      'destroyInactivePanel',
      'destroyOnHidden',
    );
  }

  // Align with logic position
  const mergedExpandIconPosition = React.useMemo<'start' | 'end'>(() => {
    if (expandIconPosition === 'left') {
      return 'start';
    }
    return expandIconPosition === 'right' ? 'end' : expandIconPosition;
  }, [expandIconPosition]);

  const mergedExpandIcon = expandIcon ?? contextExpandIcon;

  const renderExpandIcon = React.useCallback(
    (panelProps: PanelProps = {}) => {
      const icon =
        typeof mergedExpandIcon === 'function' ? (
          mergedExpandIcon(panelProps)
        ) : (
          <RightOutlined
            rotate={panelProps.isActive ? (direction === 'rtl' ? -90 : 90) : undefined}
            aria-label={panelProps.isActive ? 'expanded' : 'collapsed'}
          />
        );
      return cloneElement(icon, () => ({
        className: classNames(
          (icon as React.ReactElement<{ className?: string }>).props?.className,
          `${prefixCls}-arrow`,
        ),
      }));
    },
    [mergedExpandIcon, prefixCls, direction],
  );

  const collapseClassName = classNames(
    `${prefixCls}-icon-position-${mergedExpandIconPosition}`,
    {
      [`${prefixCls}-borderless`]: !bordered,
      [`${prefixCls}-rtl`]: direction === 'rtl',
      [`${prefixCls}-ghost`]: !!ghost,
      [`${prefixCls}-${mergedSize}`]: mergedSize !== 'middle',
    },
    contextClassName,
    className,
    rootClassName,
    hashId,
    cssVarCls,
  );

  const openMotion = React.useMemo<CSSMotionProps>(
    () => ({
      ...initCollapseMotion(rootPrefixCls),
      motionAppear: false,
      leavedClassName: `${prefixCls}-content-hidden`,
    }),
    [rootPrefixCls, prefixCls],
  );

  const items = React.useMemo<React.ReactNode[] | null>(() => {
    if (!children) {
      return null;
    }
    return toArray(children).map((child, index) => {
      const childProps = (
        child as React.ReactElement<{ disabled?: boolean; collapsible?: CollapsibleType }>
      ).props;
      if (childProps?.disabled) {
        const key = child.key ?? String(index);
        const mergedChildProps: Omit<CollapseProps, 'items'> & { key: React.Key } = {
          ...omit(child.props as any, ['disabled']),
          key,
          collapsible: childProps.collapsible ?? 'disabled',
        };
        return cloneElement(child, mergedChildProps);
      }
      return child;
    });
  }, [children]);

  return wrapCSSVar(
    // @ts-ignore
    <RcCollapse
      ref={ref}
      openMotion={openMotion}
      {...omit(props, ['rootClassName'])}
      expandIcon={renderExpandIcon}
      prefixCls={prefixCls}
      className={collapseClassName}
      style={{ ...contextStyle, ...style }}
      // TODO: In the future, destroyInactivePanel in rc-collapse needs to be upgrade to destroyOnHidden
      destroyInactivePanel={destroyOnHidden ?? destroyInactivePanel}
    >
      {items}
    </RcCollapse>,
  );
});

if (process.env.NODE_ENV !== 'production') {
  Collapse.displayName = 'Collapse';
}

export default Object.assign(Collapse, { Panel: CollapsePanel });

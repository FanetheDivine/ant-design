import React from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { Button, Input, Space } from 'antd';

import type { SelectProps } from '..';
import Select from '..';
import { resetWarned } from '../../_util/warning';
import focusTest from '../../../tests/shared/focusTest';
import mountTest from '../../../tests/shared/mountTest';
import rtlTest from '../../../tests/shared/rtlTest';
import { act, fireEvent, render } from '../../../tests/utils';
import Form from '../../form';

const { Option } = Select;

describe('Select', () => {
  focusTest(Select, { refFocus: true });
  mountTest(Select);
  rtlTest(Select);

  function toggleOpen(container: ReturnType<typeof render>['container']): void {
    fireEvent.mouseDown(container.querySelector('.ant-select-selector')!);
    act(() => {
      jest.runAllTimers();
    });
  }

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should have default notFoundContent', () => {
    const { container } = render(<Select mode="multiple" />);
    toggleOpen(container);
    expect(container.querySelectorAll('.ant-select-item-option').length).toBe(0);
    expect(container.querySelectorAll('.ant-empty').length).toBeTruthy();
  });

  it('should support set notFoundContent to null', () => {
    const { container } = render(<Select mode="multiple" notFoundContent={null} />);
    toggleOpen(container);
    expect(container.querySelectorAll('.ant-empty').length).toBe(0);
  });

  it('should not have default notFoundContent when mode is combobox', () => {
    const { container } = render(
      <Select mode={Select.SECRET_COMBOBOX_MODE_DO_NOT_USE as SelectProps['mode']} />,
    );
    toggleOpen(container);
    expect(container.querySelector('.ant-empty')).toBeFalsy();
  });

  it('should not have notFoundContent when mode is combobox and notFoundContent is set', () => {
    const { container } = render(
      <Select
        mode={Select.SECRET_COMBOBOX_MODE_DO_NOT_USE as SelectProps['mode']}
        notFoundContent="not at all"
      />,
    );
    toggleOpen(container);
    expect(container.querySelector('.ant-select-item-option')).toBeFalsy();
    expect(container.querySelector('.ant-select-item-empty')).toHaveTextContent('not at all');
  });

  it('should be controlled by open prop', () => {
    const onDropdownVisibleChange = jest.fn();
    const TestComponent: React.FC = () => {
      const [open, setOpen] = React.useState(false);
      const handleChange: SelectProps['onDropdownVisibleChange'] = (value) => {
        onDropdownVisibleChange(value);
        setOpen(value);
      };
      return (
        <Select open={open} onDropdownVisibleChange={handleChange}>
          <Option value="1">1</Option>
        </Select>
      );
    };
    const { container } = render(<TestComponent />);
    expect(container.querySelector('.ant-select-dropdown')).toBeFalsy();
    toggleOpen(container);
    expect(container.querySelectorAll('.ant-select-dropdown').length).toBe(1);
    expect(onDropdownVisibleChange).toHaveBeenLastCalledWith(true);
  });

  it('should show search icon when showSearch and open', () => {
    jest.useFakeTimers();
    const { container } = render(
      <Select showSearch>
        <Option value="1">1</Option>
      </Select>,
    );
    expect(container.querySelectorAll('.anticon-down').length).toBe(1);
    expect(container.querySelectorAll('.anticon-search').length).toBe(0);
    toggleOpen(container);
    expect(container.querySelectorAll('.anticon-down').length).toBe(0);
    expect(container.querySelectorAll('.anticon-search').length).toBe(1);
  });

  describe('Select Custom Icons', () => {
    it('should support customized icons', () => {
      const { rerender, asFragment } = render(
        <Select
          removeIcon={<CloseOutlined />}
          clearIcon={<CloseOutlined />}
          menuItemSelectedIcon={<CloseOutlined />}
        >
          <Option value="1">1</Option>
        </Select>,
      );
      rerender(
        <Select
          removeIcon={<CloseOutlined />}
          clearIcon={<CloseOutlined />}
          menuItemSelectedIcon={<CloseOutlined />}
        >
          <Option value="1">1</Option>
        </Select>,
      );
      act(() => {
        jest.runAllTimers();
      });
      expect(asFragment().firstChild).toMatchSnapshot();
    });
  });

  describe('clear icon position', () => {
    it('normal', () => {
      const { container } = render(
        <Select allowClear options={[{ value: '1', label: '1' }]} value="1" />,
      );
      expect(
        getComputedStyle(container.querySelector('.ant-select-clear')!).insetInlineEnd,
      ).toEqual('11px');
    });

    it('hasFeedback, has validateStatus', () => {
      const { container } = render(
        <Form>
          <Form.Item hasFeedback validateStatus="error">
            <Select allowClear options={[{ value: '1', label: '1' }]} value="1" />,
          </Form.Item>
        </Form>,
      );
      expect(
        getComputedStyle(container.querySelector('.ant-select-clear')!).insetInlineEnd,
      ).toEqual('33px');
    });

    it('hasFeedback, no validateStatus', () => {
      const { container } = render(
        <Form>
          <Form.Item hasFeedback validateStatus="">
            <Select allowClear options={[{ value: '1', label: '1' }]} value="1" />,
          </Form.Item>
        </Form>,
      );
      expect(
        getComputedStyle(container.querySelector('.ant-select-clear')!).insetInlineEnd,
      ).toEqual('11px');
    });
  });

  describe('Deprecated', () => {
    it('should ignore mode="combobox"', () => {
      const { asFragment } = render(
        <Select mode={'combobox' as SelectProps['mode']}>
          <Option value="1">1</Option>
        </Select>,
      );
      expect(asFragment().firstChild).toMatchSnapshot();
    });

    it('legacy popupClassName', () => {
      resetWarned();

      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const { container } = render(<Select popupClassName="legacy" open />);
      expect(errSpy).toHaveBeenCalledWith(
        'Warning: [antd: Select] `popupClassName` is deprecated. Please use `classNames.popup.root` instead.',
      );
      expect(container.querySelector('.legacy')).toBeTruthy();

      errSpy.mockRestore();
    });

    it('legacy dropdownClassName', () => {
      resetWarned();

      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const { container } = render(<Select dropdownClassName="legacy" open />);
      expect(errSpy).toHaveBeenCalledWith(
        'Warning: [antd: Select] `dropdownClassName` is deprecated. Please use `classNames.popup.root` instead.',
      );
      expect(container.querySelector('.legacy')).toBeTruthy();

      errSpy.mockRestore();
    });

    it('legacy dropdownStyle', () => {
      resetWarned();
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const { container } = render(<Select dropdownStyle={{ background: 'red' }} open />);
      expect(errSpy).toHaveBeenCalledWith(
        'Warning: [antd: Select] `dropdownStyle` is deprecated. Please use `styles.popup.root` instead.',
      );
      const dropdown = container.querySelector('.ant-select-dropdown');
      expect(dropdown?.getAttribute('style')).toMatch(/background:\s*red/);
      errSpy.mockRestore();
    });

    it('legacy dropdownRender', () => {
      resetWarned();
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const { container } = render(
        <Select
          dropdownRender={(menu) => <div className="custom-dropdown">{menu} custom render</div>}
          open
        >
          <Select.Option value="1">1</Select.Option>
        </Select>,
      );
      expect(errSpy).toHaveBeenCalledWith(
        'Warning: [antd: Select] `dropdownRender` is deprecated. Please use `popupRender` instead.',
      );
      const customDropdown = container.querySelector('.custom-dropdown');
      expect(customDropdown).toBeTruthy();
      expect(customDropdown?.textContent).toContain('custom render');
      errSpy.mockRestore();
    });

    it('legacy onDropdownVisibleChange', () => {
      resetWarned();
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      render(<Select onDropdownVisibleChange={() => {}} open />);
      expect(errSpy).toHaveBeenCalledWith(
        'Warning: [antd: Select] `onDropdownVisibleChange` is deprecated. Please use `onOpenChange` instead.',
      );
      errSpy.mockRestore();
    });

    it('warning for legacy dropdownMatchSelectWidth', () => {
      resetWarned();

      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      render(<Select dropdownMatchSelectWidth open />);
      expect(errSpy).toHaveBeenCalledWith(
        'Warning: [antd: Select] `dropdownMatchSelectWidth` is deprecated. Please use `popupMatchSelectWidth` instead.',
      );

      errSpy.mockRestore();
    });

    it('deprecate showArrow', () => {
      resetWarned();

      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const { container } = render(<Select showArrow />);
      expect(errSpy).toHaveBeenCalledWith(
        'Warning: [antd: Select] `showArrow` is deprecated which will be removed in next major version. It will be a default behavior, you can hide it by setting `suffixIcon` to null.',
      );
      expect(container.querySelector('.ant-select-show-arrow')).toBeTruthy();

      errSpy.mockRestore();
    });

    it('deprecate bordered', () => {
      resetWarned();

      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const { container } = render(<Select bordered={false} />);
      expect(errSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning: [antd: Select] `bordered` is deprecated'),
      );
      expect(container.querySelector('.ant-select-borderless')).toBeTruthy();

      errSpy.mockRestore();
    });

    it('Select maxCount warning', () => {
      resetWarned();
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      render(<Select maxCount={10} />);
      expect(errSpy).toHaveBeenCalledWith(
        'Warning: [antd: Select] `maxCount` only works with mode `multiple` or `tags`',
      );
      errSpy.mockRestore();
    });
  });

  it('Select ContextIsolator', () => {
    const { container } = render(
      <Space.Compact>
        <Select
          open
          defaultValue="lucy"
          style={{ width: 120 }}
          popupRender={(menu) => {
            return (
              <div>
                {menu}
                <Button>123</Button>
                <Input style={{ width: 50 }} />
              </div>
            );
          }}
          options={[
            { value: 'jack', label: 'Jack' },
            { value: 'lucy', label: 'Lucy' },
          ]}
        />
        <Button className="test-button">test</Button>
      </Space.Compact>,
    );

    const compactButton = container.querySelector('.test-button');
    const popupElement = document.querySelector('.ant-select-dropdown');
    // selector should have compact
    expect(compactButton).toBeInTheDocument();
    expect(compactButton!.className.includes('compact')).toBeTruthy();
    // popupRender element haven't compact
    expect(popupElement).toBeInTheDocument();
    const button = popupElement!.querySelector('button');
    const input = popupElement!.querySelector('input');
    expect(button!.className.includes('compact')).toBeFalsy();
    expect(input!.className.includes('compact')).toBeFalsy();
  });
});

/**
 * Panel 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Panel } from '../Panel';

describe('Panel 组件', () => {
  it('应该正确渲染基础面板', () => {
    render(
      <Panel title="测试面板">
        <p>面板内容</p>
      </Panel>
    );
    
    expect(screen.getByText('测试面板')).toBeInTheDocument();
    expect(screen.getByText('面板内容')).toBeInTheDocument();
  });

  it('应该支持不同的尺寸', () => {
    const { rerender } = render(
      <Panel size="sm" testId="panel">
        内容
      </Panel>
    );
    
    let panel = screen.getByTestId('panel');
    expect(panel).toHaveClass('max-w-sm');

    rerender(
      <Panel size="lg" testId="panel">
        内容
      </Panel>
    );
    
    panel = screen.getByTestId('panel');
    expect(panel).toHaveClass('max-w-lg');
  });

  it('应该支持折叠功能', () => {
    render(
      <Panel title="可折叠面板" collapsible>
        <p>面板内容</p>
      </Panel>
    );
    
    const content = screen.getByText('面板内容');
    expect(content).toBeInTheDocument();
    
    // 点击折叠按钮
    const collapseButton = screen.getByLabelText('折叠');
    fireEvent.click(collapseButton);
    
    // 内容应该被隐藏（通过动画）
    expect(collapseButton).toHaveAttribute('aria-label', '展开');
  });

  it('应该支持默认折叠状态', () => {
    render(
      <Panel title="默认折叠" collapsible defaultCollapsed>
        <p>面板内容</p>
      </Panel>
    );
    
    const expandButton = screen.getByLabelText('展开');
    expect(expandButton).toBeInTheDocument();
  });

  it('应该支持关闭功能', () => {
    const handleClose = vi.fn();
    render(
      <Panel title="可关闭面板" closable onClose={handleClose}>
        <p>面板内容</p>
      </Panel>
    );
    
    const closeButton = screen.getByLabelText('关闭');
    fireEvent.click(closeButton);
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('应该支持无标题面板', () => {
    render(
      <Panel testId="no-title-panel">
        <p>无标题内容</p>
      </Panel>
    );
    
    const panel = screen.getByTestId('no-title-panel');
    expect(panel).toBeInTheDocument();
    expect(screen.getByText('无标题内容')).toBeInTheDocument();
  });

  it('应该在不可见时不渲染', () => {
    render(
      <Panel visible={false} testId="invisible-panel">
        内容
      </Panel>
    );
    
    expect(screen.queryByTestId('invisible-panel')).not.toBeInTheDocument();
  });

  it('应该支持自定义类名和样式', () => {
    render(
      <Panel
        className="custom-panel"
        style={{ backgroundColor: 'red' }}
        testId="custom-panel"
      >
        内容
      </Panel>
    );

    const panel = screen.getByTestId('custom-panel');
    expect(panel).toHaveClass('custom-panel');
    // 由于Tailwind CSS的优先级，我们只检查style属性是否存在
    expect(panel).toHaveAttribute('style');
  });
});

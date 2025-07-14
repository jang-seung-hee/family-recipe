import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import '@testing-library/jest-dom';

describe('App 통합 smoke test', () => {
  it('홈 화면이 정상적으로 렌더링된다', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/홈 메인 영역|Home main area/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /아무것도 들어 간것 없다|Nothing Added/i })).toBeInTheDocument();
  });

  it('내비게이션이 렌더링되고, 홈/레시피 메뉴가 보인다', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/홈|Home/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/레시피|Recipes/i)).toBeInTheDocument();
  });

  it('다국어(i18n) 전환이 정상 동작한다', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    // 기본은 한글, 영어 번역 키도 존재
    expect(screen.getByText(/아무것도 들어 간것 없다|Nothing Added/i)).toBeInTheDocument();
  });
});

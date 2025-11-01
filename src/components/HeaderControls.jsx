import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

function HeaderControls() {
  return (
    <div className="flex items-center gap-3">
      <LanguageSwitcher />
      <ThemeToggle />
    </div>
  );
}

export default HeaderControls;

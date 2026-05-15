import AboutWidget from './sidebar-widgets/AboutWidget';
import BrowseByTopicWidget from './sidebar-widgets/BrowseByTopicWidget';
import BrowseByCategoryWidget from './sidebar-widgets/BrowseByCategoryWidget';
import CrossPromoWidget from './sidebar-widgets/CrossPromoWidget';

function Sidebar({ variant }) {
  return (
    <aside className="insights-sidebar" aria-label="Sidebar">
      <AboutWidget />
      {variant === 'insights' && (
        <>
          <BrowseByTopicWidget />
          <CrossPromoWidget mode="labkit" />
        </>
      )}
      {variant === 'labkit' && (
        <>
          <BrowseByCategoryWidget />
          <CrossPromoWidget mode="insights" />
        </>
      )}
    </aside>
  );
}

export default Sidebar;

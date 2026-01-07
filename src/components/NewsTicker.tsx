import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockNews } from '@/data/mockData';

const NewsTicker: React.FC = () => {
  const { t } = useLanguage();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-4">{t('news.title')}</h3>
      <div className="space-y-3">
        {mockNews.slice(0, 4).map((news) => (
          <a
            key={news.id}
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-all group"
          >
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {news.title}
              </h4>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                <span>{news.source}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(news.publishedAt)}
                </div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default NewsTicker;

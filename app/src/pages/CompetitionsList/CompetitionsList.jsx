import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { competitionActions, competitionSelectors } from 'redux/competitions';
import { debounce } from 'lodash';
import { Helmet } from 'react-helmet';
import { COMPETITION_STATUSES, COMPETITION_TYPES, ALL_METRICS } from 'config';
import { useUrlContext, useLazyLoading } from 'hooks';
import { PageTitle, TextButton } from 'components';
import URL from 'utils/url';
import { Controls, List } from './containers';
import { CompetitionsListContext } from './context';
import './CompetitionsList.scss';

function CompetitionsList() {
  const dispatch = useDispatch();

  // State variables
  const [titleSearch, setTitleSearch] = useState('');

  const { context, updateContext } = useUrlContext(encodeContext, decodeURL);
  const { metric, type, status } = context;

  const { isFullyLoaded, reloadData } = useLazyLoading({
    resultsPerPage: 20,
    selector: competitionSelectors.getCompetitions,
    action: handleLoadData
  });

  function handleLoadData(limit, offset) {
    dispatch(competitionActions.fetchList(titleSearch, metric, status, type, limit, offset));
  }

  // Debounce search input keystrokes by 500ms
  const handleSubmitSearch = debounce(reloadData, 500, { leading: true, trailing: false });

  // Submit search each time any of the search variable change
  useEffect(handleSubmitSearch, [titleSearch, metric, type, status]);

  return (
    <CompetitionsListContext.Provider value={{ context, updateContext }}>
      <div className="competitions__container container">
        <Helmet>
          <title>Competitions</title>
        </Helmet>
        <div className="competitions__header row">
          <div className="col">
            <PageTitle title="Competitions" />
          </div>
          <div className="col">
            <TextButton text="Create new" url="/competitions/create" />
          </div>
        </div>
        <div className="competitions__options row">
          <Controls onSearchInputChanged={e => setTitleSearch(e.target.value)} />
        </div>
        <div className="competitions__list row">
          <List />
        </div>
        <div className="row">
          <div className="col">{!isFullyLoaded && <b className="loading-indicator">Loading...</b>}</div>
        </div>
      </div>
    </CompetitionsListContext.Provider>
  );
}

function encodeContext({ metric, status, type }) {
  const nextURL = new URL('/competitions');

  if (metric) nextURL.appendSearchParam('metric', metric);
  if (status) nextURL.appendSearchParam('status', status);
  if (type) nextURL.appendSearchParam('type', type);

  return nextURL.getPath();
}

function decodeURL(_, query) {
  const isValidType = query.type && COMPETITION_TYPES.includes(query.type);
  const isValidStatus = query.status && COMPETITION_STATUSES.includes(query.status);
  const isValidMetric = query.metric && ALL_METRICS.includes(query.metric);

  return {
    type: isValidType ? query.type : null,
    status: isValidStatus ? query.status : null,
    metric: isValidMetric ? query.metric : null
  };
}

export default CompetitionsList;

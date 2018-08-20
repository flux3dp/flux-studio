define([
    'react',
    'fuse',
    'jsx!widgets/Modal',
    'app/actions/beambox/beambox-preference',
    'app/actions/film-cutter/film-database',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'app/actions/alert-actions',
    'helpers/i18n',
], function(
    React,
    Fuse,
    Modal,
    BeamboxPreference,
    FilmDatabase,
    ProgressActions,
    ProgressConstants,
    AlertActions,
    i18n
) {
    const LANG = i18n.lang.beambox.left_panel.advanced_panel;
    const Btn = ({children, onClick, className}) => (<div className={'btn btn-default ' + className} onClick={onClick}>{children}</div>);

    const SearchInput = ({value, onChange}) => {
        return (
            <input
                type='text'
                className='search-input'
                value={value}
                onChange={onChange}
                onKeyUp={onChange}
            />
        );
    };
    const ITEM_PER_PAGE = 28;
    return class DownloadFilms extends React.Component {
        constructor() {
            super();
            this.state = {
                fuse: null, // the object provide fuzzy search
                searchString: '',
                brand: undefined,
                model: undefined,
                source: [],
                currentPage: 1,
                pageCount: 1,
            };
        }
        componentWillMount() {
            this.flushFuseSerachingBase();
        }
        componentDidMount() {
            this.updateSource();
        }
        flushFuseSerachingBase() {
            const source = FilmDatabase.lsAll('svg');
            this.state.fuse = new Fuse(
                source,
                {
                    shouldSort: true,
                    threshold: 0.6,
                    location: 0,
                    distance: 100,
                    maxPatternLength: 32,
                    minMatchCharLength: 1,
                    keys: [
                        'brand',
                        'model'
                    ]
                }
            );
        }
        sliceToCurrentPage(list) {
            const currentPage = this.state.currentPage;
            const start = (currentPage - 1) * ITEM_PER_PAGE;
            const end = currentPage * ITEM_PER_PAGE;
            return list.slice(start, end);
        }
        updateSource(brand, model) {
            const newSource = FilmDatabase.ls('svg', brand, model)
                .map(x => {
                    if (brand && model) {
                        return {brand, model, category: x.replace('.enc', '')};
                    } else if (brand) {
                        return {brand, model:x};
                    } else {
                        return {brand: x};
                    }
                });
            this.setState({
                source: newSource,
                currentPage: 1,
                pageCount: Math.max(Math.ceil(newSource.length / ITEM_PER_PAGE), 1),
            });
        }
        async handleDownloadClick() {
            if(!FilmDatabase.validateUsageDownload()) {
                AlertActions.showPopupError('film-cutter', '已超过数据下载期限');
                return;
            }
            if(!navigator.onLine) {
                AlertActions.showPopupError('film-cutter', '请先连上网路');
                return;
            }

            try {
                ProgressActions.open(ProgressConstants.WAITING, '下载数据中...');
                await FilmDatabase.syncWithCloud();
                ProgressActions.close();
                AlertActions.showPopupInfo('film-cutter', '已成功更新数据');
                this.updateSource();
                this.flushFuseSerachingBase();
            } catch (error) {
                AlertActions.showPopupError('film-cutter', error.toString());
                ProgressActions.close();
            }
        }

        handlResetClick() {
            AlertActions.showPopupYesNo('film-cutter', '您确定要重设手机膜吗？这将清空所有已下载的手机模数据。', '重设手机膜', null, {
                yes: () => {
                    FilmDatabase.reset();
                    this.flushFuseSerachingBase();
                    this.updateSource();
                },
                no: () => {}
            });
        }

        handleInsertFile(brand, model, category) {
            let content;
            try {
                content = FilmDatabase.get('svg', brand, model, category, 'enc');
                if (content === '') {
                    console.log('decoded file === \'\'');
                    throw new Error();
                }
            } catch (error) {
                console.log('error: ', error);
                AlertActions.showPopupError('film-cutter', '档案解密失败');
            }
            try {
                window.importFilmSvg(content, `${brand}-${model}-${category}`);
            } catch (error) {
                console.log('error: ', error);
                AlertActions.showPopupError('film-cutter', 'SVG 汇入发生异常');
            }
            this.props.onClose();
        }
        _handleBackClick() {
            if(this.state.model) {
                this.updateSource(this.state.brand);
                this.setState({model: undefined});
                return;
            }
            if(this.state.brand) {
                this.updateSource();
                this.setState({brand: undefined});
                return;
            }
            this.updateSource();
        }
        _handlePageClick(val) {
            let newPage = this.state.currentPage + val;
            newPage = Math.min(newPage, this.state.pageCount);
            newPage = Math.max(newPage, 1);
            this.setState({currentPage: newPage});
        }

        _handleChoiceItemClick(brand, model, category) {
            if (brand && model && category) {
                this.handleInsertFile(brand, model, category);
                return;
            }
            this.updateSource(brand, model, category);
            this.setState({
                searchString: '',
                brand,
                model
            });
        }

        handleSearchInputChange(val) {
            this.setState({
                searchString: val,
                brand: undefined,
                model: undefined,
            });
            if (val) {
                this.setState({source: this.state.fuse.search(val)});
            } else {
                this.updateSource();
            }
        }
        _renderMainContent() {
            if (!this.state.source.length) {
                return <div style={{margin: '40% auto', textAlign: 'center'}}>请下载手机膜以开始使用</div>;
            }
            const btns = this.sliceToCurrentPage(this.state.source).map(x => {
                const label = this.state.searchString ? `${x.brand} - ${x.model}` : (x.category || x.model || x.brand);
                return (<Btn
                    className={this.state.searchString ? 'search-result' : ''}
                    key={label}
                    onClick={() => this._handleChoiceItemClick(x.brand, x.model, x.category)}
                >
                    {label}
                </Btn>);
            });
            return <div>{btns}</div>;
        }
        _renderBanner() {
            if (this.state.searchString) {
                return <span/>;
            }
            return <span>{[this.state.brand, this.state.model].filter(x => !!x).join(' - ') || ' '}</span>;
        }
        _renderPagination() {
            if (this.state.pageCount === 1) {
                return '';
            }
            return (
                <section className='pagination'>
                    <Btn onClick={() => this._handlePageClick(-1)}>◀ </Btn>
                    <span className='pager'>{this.state.currentPage} / {this.state.pageCount}</span>
                    <Btn onClick={() => this._handlePageClick(1)}> ▶</Btn>
                </section>
            );
        }
        render() {
            return (
                <Modal onClose={() => this.props.onClose()}>
                    <div className='download-films-panel'>
                        <section className='main-content'>
                            <div className='title'>{'选择手机膜'}</div>
                            <div className='title-bar'>
                                {this._renderBanner()}
                                <SearchInput
                                    onChange={e => this.handleSearchInputChange(e.target.value)}
                                    value={this.state.searchString}
                                />
                            </div>

                            {this._renderMainContent()}
                        </section>
                        {this._renderPagination()}
                        <section className='footer'>
                            <button
                                className='btn btn-default pull-right'
                                onClick={() => this.props.onClose()}
                            >{LANG.cancel}
                            </button>
                            <button
                                className='btn btn-default pull-right'
                                onClick={() => this.handleDownloadClick()}
                            >{'下载最新手机膜'}
                            </button>
                            <button
                                className='btn btn-default pull-right'
                                onClick={() => this.handlResetClick()}
                            >{'清空所有档案'}
                            </button>
                            <button
                                className='btn btn-default pull-left'
                                onClick={() => {
                                    this._handleBackClick();
                                }}
                            >{'上一层'}
                            </button>
                        </section>
                    </div>
                </Modal>
            );
        }
    };
});

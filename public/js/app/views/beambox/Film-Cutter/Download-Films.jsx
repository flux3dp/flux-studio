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

    const Btn = ({children, onClick}) => (<div className={'btn btn-default'} onClick={onClick}>{children}</div>);
    const BrandBtns = ({onBrandClick}) => {
        const brands = FilmDatabase.ls('svg');
        const btns = brands.map(brand => (
            <Btn onClick={() => onBrandClick(brand)} key={brand}>{brand}</Btn>
        ));
        return <div>{btns}</div>;
    };
    const ModelBtns = ({brand, onModelClick}) => {
        const models = FilmDatabase.ls('svg', brand);
        const btns = models.map(model => (
            <Btn onClick={() => onModelClick(model)} key={model}>{model}</Btn>
        ));
        return <div>{btns}</div>;
    };
    const CategoryBtns = ({brand, model, onCategoryClick}) => {
        const categories = FilmDatabase.ls('svg', brand, model);
        const btns = categories
            .map(cat => cat.replace('.enc', ''))
            .map(cat => (
                <Btn onClick={() => onCategoryClick(cat)} key={cat}>{cat}</Btn>
            ));
        return <div>{btns}</div>;
    };
    const MatchedBtn = ({brand, model, onMatchedClick}) => {
        const label = `${brand} - ${model}`;
        return (<Btn onClick={() => onMatchedClick(brand, model)} key={label}>{label}</Btn>);
    };
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

    return class DownloadFilms extends React.Component {
        constructor() {
            super();
            this.state = {
                fuse: null, // the object provide fuzzy search
                searchString: '',
                brand: undefined,
                model: undefined,
            };
        }
        componentWillMount() {
            this.flushSearchingSource();
        }
        flushSearchingSource() {
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
                this.flushSearchingSource();
            } catch (error) {
                AlertActions.showPopupError('film-cutter', error.toString());
                ProgressActions.close();
            }
        }

        handlResetClick() {
            AlertActions.showPopupYesNo('film-cutter', '您确定要重设手机膜吗？这将清空所有已下载的手机模数据。', '重设手机膜', null, {
                yes: () => {
                    FilmDatabase.reset();
                    this.forceUpdate();
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
                this.setState({model: undefined});
                return;
            }
            if(this.state.brand) {
                this.setState({brand: undefined});
                return;
            }
        }

        _renderBrands() {
            const onBrandClick = (brand) => {
                this.setState({brand});
            };
            return <BrandBtns onBrandClick={onBrandClick}/>;
        }
        _renderModels() {
            const onModelClick = (model) => {
                this.setState({model});
            };
            return <ModelBtns brand={this.state.brand} onModelClick={onModelClick}/>;
        }
        _renderCategories() {
            const onCategoryClick = (category) => {
                this.handleInsertFile(this.state.brand, this.state.model, category);
            };
            return (
                <CategoryBtns
                    brand={this.state.brand}
                    model={this.state.model}
                    onCategoryClick={onCategoryClick}
                />);
        }
        _renderMatchedItems() {
            const items = this.state.fuse.search(this.state.searchString);
            const onMatchedClick = (brand, model) => {
                this.setState({
                    searchString: '',
                    brand,
                    model
                });
            };
            const btns = items.map(x =>
                (<MatchedBtn
                    brand={x.brand}
                    model={x.model}
                    onMatchedClick={onMatchedClick}
                />));
            return <div>{btns}</div>;
        }
        _renderMainContent() {
            if (this.state.searchString) {
                return this._renderMatchedItems();
            }

            if(this.state.brand && this.state.model) {
                return this._renderCategories();
            }

            if(this.state.brand) {
                return this._renderModels();
            }

            return this._renderBrands();
        }
        _renderBanner() {
            return <span>{[this.state.brand, this.state.model].filter(x => !!x).join(' - ') || ' '}</span>;
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
                                    onChange={e => this.setState({searchString: e.target.value})}
                                    value={this.state.searchString}
                                />
                            </div>

                            {this._renderMainContent()}
                        </section>
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
                            >{'上一页'}
                            </button>
                        </section>
                    </div>
                </Modal>
            );
        }
    };
});

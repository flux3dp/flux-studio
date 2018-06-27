define([
    'react',
    'jsx!widgets/Modal',
    'app/actions/beambox/beambox-preference',
    'app/actions/film-cutter/usage-download-manager',
    'app/actions/film-cutter/film-database',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'app/actions/alert-actions',
    'helpers/i18n',
], function(
    React,
    Modal,
    BeamboxPreference,
    UsageDownloadManager,
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

    return class DownloadFilms extends React.Component {
        constructor() {
            super();
            this.state = {
                brand: undefined,
                model: undefined,
            };
        }

        async handleDownloadClick() {
            if(!UsageDownloadManager.validate()) {
                AlertActions.showPopupError('film-cutter', '已超過數據下載期限');
                return;
            }
            try {
                ProgressActions.open(ProgressConstants.WAITING, '下載數據中...');
                await FilmDatabase.syncWithCloud();
                ProgressActions.close();
                AlertActions.showPopupInfo('film-cutter', '已成功更新數據');
                this.forceUpdate();
            } catch (error) {
                AlertActions.showPopupError('film-cutter', error.toString());
                ProgressActions.close();
            }

        }

        handlResetClick() {
            AlertActions.showPopupYesNo('film-cutter', '您確定要重設手機膜嗎？這將清空所有已下載的手機模數據。', '重設手機膜', null, {
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
            } catch (error) {
                AlertActions.showPopupError('film-cutter', '檔案解密失敗');
            }
            try {
                window.importFilmSvg(content, `${brand}-${model}-${category}`);
            } catch (error) {
                AlertActions.showPopupError('film-cutter', 'SVG 插入發生異常');
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
        _renderMainContent() {
            if(this.state.brand && this.state.model) {
                return this._renderCategories();
            } else if(this.state.brand) {
                return this._renderModels();
            } else {
                return this._renderBrands();
            }
        }
        _renderBanner() {
            return [this.state.brand, this.state.model].filter(x => !!x).join(' - ');
        }
        render() {
            return (
                <Modal onClose={() => this.props.onClose()}>
                    <div className='advanced-panel'>
                        <section className='main-content'>
                            <div className='title'>{'選擇手機膜'} {this._renderBanner()}</div>
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
                            >{'下載最新手機膜'}
                            </button>
                            <button
                                className='btn btn-default pull-right'
                                onClick={() => this.handlResetClick()}
                            >{'清空所有檔案'}
                            </button>
                            <button
                                className='btn btn-default pull-left'
                                onClick={() => {
                                    this._handleBackClick();
                                }}
                            >{'上一頁'}
                            </button>
                        </section>
                    </div>
                </Modal>
            );
        }
    };
});

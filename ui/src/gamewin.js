

import MapView from './mapview.js';
import BuildDock from './builddock.js';
import StatusBar from './statusbar.js';
import BudgetDialog from './budgetdialog.js';
import {Co2Dialog} from './co2dialog.js';
import {ConsoDialog} from './consodialog.js';
import {EndDialog} from './enddialog.js';
import {NewGameDialog} from './newgamedialog.js';
import {tr} from '../../tr/tr.js';
import {CloseButton} from './closebutton.js';

import Scene from '../scene.js';

import {Simulateur, promiseSimulater, objSum} from '../../simulateur/simulateur.js';

function NullDialog(props){
    return null;
}
function NullHelp(props){
    return null;
}


/** @brief playing window
*/
export default class GameWin extends React.Component{
    constructor(props){
        super(props);

        //those are no state bc their draw is not related to a DOM change
        this.simu= null;
        this.targetBuild= {},
        this.targetBuildLoc= {pos:{x:0, y:0}, radius:0},

        this.state = {
            currentBuildInfo:{
                theoReason: "",
                buildCost: 0,
                buildCo2: 0,
                perYearCost: 0,
                perYearCo2: 0,
                nameplate: 0,
                pop: 0,
                explCost: 0,
                coolingWaterRate: 0,
                storageCapacity: 0,
                confirmOnDock: false,
            },
            money: 0,
            currentDialog: NewGameDialog,
            help: NullHelp,
        };



        this.slider = {default: 50, min: 1, max: 100,
            sliderChange: (r) => this.setTargetBuildLoc({radius: Number(r)})};
        let mainWin = this;


        this.scene = new Scene();
    }


    /** callback
        set the current target build
        target is a string as specified in builddock.js
    */
    setTargetBuild(target){
        if(target === undefined && this.targetBuild.type === undefined)
            return;
        if(target === undefined){//we just cleaered the cursor
            this.scene.cursor.type = undefined;
        }

        this.targetBuild.type = target;
        this.targetBuildLoc = {pos:{x:0, y:0}, radius: this.slider.default};

        this.updateBuildDock();
    }

    /** callback
        set the current location of the cursor as {pos:{x:,y:}, radius:}
    */
    setTargetBuildLoc({pos=this.targetBuildLoc.pos,
                    radius=this.targetBuildLoc.radius, confirmOnDock=false}){
        if(this.targetBuild.type === undefined)
            return;

        this.targetBuildLoc = {
            pos: pos,
            radius: radius,
        };

        this.scene.cursor={
                        type:this.targetBuild.type,
                        radius: this.targetBuildLoc.radius,
                        pos:this.targetBuildLoc.pos
                    };
        this.updateBuildDock();
    }

    updateBuildDock(){
        if(this.targetBuild.type === undefined){
            this.forceUpdate();
            return;
        }

        const info = this.simu.onBuildMenuStateChanged(
            this.targetBuild, this.targetBuildLoc.pos,
            this.targetBuildLoc.radius).info;


        let avgProd = info.nameplate ? info.nameplate.at(info.build.end) * info.avgCapacityFactor : 0;

        this.setState({
            currentBuildInfo:{
                theoReason: info.theorical,
                buildCost: info.build.cost,
                buildCo2: info.build.co2,
                perYearCost: info.perYear.cost + info.perWh.cost * avgProd,
                perYearCo2: info.perYear.co2 + info.perWh.co2 * avgProd,
                avgProd: avgProd,
                pop: info.pop_affected,
                explCost: info.expl_cost,
                coolingWaterRate: info.coolingWaterRate,
                storageCapacity: info.storageCapacity ? info.storageCapacity.at(info.build.end) : 0,
                confirmOnDock: confirmOnDock,
            }});
    }

    runYear(){
        this.simu.run();
        if(this.simu.year == 2070){
            this.setState({
                currentDialog: EndDialog,
            });

            this.setTargetBuild(undefined);
        }


        this.forceUpdate();
    }

    showBudgetDialog(){
        this.setState({currentDialog: BudgetDialog});
    }

    setDialog(c){
        if(c === undefined || c === null)
            c = NullDialog;
        this.setState({currentDialog: c});
    }

    onTaxRateChanged(newVal){
        this.simu.taxRate = newVal;
        this.forceUpdate();
    }

    confirmBuild(curPos){
        this.simu.confirmCurrentBuild();
        this.forceUpdate();
    }

    startGame(simu){
        this.simu = simu;
        this.setDialog(undefined);
    }


    render(){
        if(this.state.currentDialog == NewGameDialog){
            return (<NewGameDialog
                        startRequested={this.startGame.bind(this)}
                        scene={this.scene}/>);
        }

        if(this.simu === null){
            return <p>Chargement ... </p>;
        }

        let cProd = this.simu.cProd;
        let cMap = this.simu.cMap;


        let dialog;
        if(this.state.currentDialog == EndDialog){
            let areaAll = {center:{x:0, y: 0}, radius: 100000000};

            let  energyGroundUseProp = cMap.reduceIf(['area'], areaAll, ['energy']) / cMap.reduceIf(['area'], areaAll);


            dialog = (<EndDialog
                closeRequested={this.setDialog.bind(this, null)}
                history={this.simu.stats}
                energyGroundUseProp={energyGroundUseProp}
                newGame={this.setDialog.bind(this, NewGameDialog)}
                />
            );
        }
        else{
            let CurDialog = this.state.currentDialog;

            dialog = (<CurDialog
               gdp={this.simu.gdp}
               regularTaxRate={this.simu.minTaxRate}
               taxRate={this.simu.taxRate}
               onTaxRateChanged={this.onTaxRateChanged.bind(this)}
               closeRequested={this.setDialog.bind(this, null)}
               history={this.simu.stats}
               detailsRequested = {(c) => {this.setState({help: c})}}
           />);

        }

        let helpDialog = null;
        if(this.state.help != NullHelp){
            let Help = this.state.help;
            helpDialog = (
                <div
                    className="dialog"
                    style={{
                        left: '5%',
                        right:'5%',
                        top: 'calc(var(--status-bar-height) + 20px)',// 60px
                        bottom: 30,
                        background:'white',
                        boxShadow: '0 0 50px 10px black',
                        color: 'black',
                        overflow: 'auto'
                    }}
                >
                <Help
                    productionMeans={this.simu.cProd.productionMeans}
                    countries={this.simu.cProd.countries}
                    closeRequested={() => this.setState({help: NullHelp})}
                />
            </div>);
        }

        let currentDate = this.simu.year;

        let currentConso  = cProd.countries.belgium.pop.at(currentDate) *    //watt
							cProd.countries.belgium.consoPerCap.at(currentDate);

        return (
        <div className="vLayout" style={{width: '100%', height: '100%'}}>
        <StatusBar
            date = {currentDate}
            money = {this.simu.money}
            showBudgetDialog={this.setDialog.bind(this, BudgetDialog)}
            showCo2Dialog={this.setDialog.bind(this, Co2Dialog)}
            history={this.simu.stats}
            showConsoDialog={this.setDialog.bind(this, ConsoDialog)}
            currentConso={currentConso}
        />

        <MapView
            scene = {this.scene}
            onBuildChange = {this.setTargetBuildLoc.bind(this)}
            onConfirmBuild = {this.confirmBuild.bind(this)}
        />

        <BuildDock
            buildMenuSelectionCallback = {this.setTargetBuild.bind(this)}
            target = {this.targetBuild.type}
            info = {this.state.currentBuildInfo}
            sliderRadius = {this.slider}
            detailsRequested = {(c) => {this.setState({help: c})}}
            onConfirmBuild = {() => this.confirmBuild(this.scene.cursor.pos)}
        />

        <div
            id="bNextTurn"
            className="button black"
            title={tr("Go to the next year")}
            onClick={this.runYear.bind(this)}
        >
            {tr("Next turn")}
        </div>



        {dialog}
        {helpDialog}
         </div>);
    }

}

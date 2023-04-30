import React, { Component } from 'react';
import './App.css';
import data from './data.json';

let cache = localStorage.getItem('RT-quest-giver-cache');
cache && (cache = JSON.parse(cache)); 

export const Row = (props) => {
	const { reward } = props;
	return <div className='row'>
		<div className='cell reward-title'><p>{reward.rewardType}</p></div>
		<div className='cell'><p>{reward.teir1}</p></div>
		<div className='cell'><p>{reward.teir2}</p></div>
		<div className='cell'><p>{reward.teir3}</p></div>
		{reward.description && <div className='tooltip'><p>{reward.description}</p></div>}
	</div>
}

class App extends Component {

	constructor(props) {
		super(props);
		this.state = {
			tokens: cache && cache.tokens ? cache.tokens : 0,
			incClans: cache && cache.incClans ? cache.incClans : false,
			incInnerSphere: cache && cache.incInnerSphere ? cache.incInnerSphere : true,
			quest: cache && cache.quest ? cache.quest : {}
		};
	}

	fetchRandomItem(array) {
		return array[Math.floor(Math.random() * Math.floor(array.length-1))];
	}

	generateQuest() {
		let newQuest = {};

		let factionPool = [],
			   roll = Math.floor(Math.random() * Math.floor(100));
			   
		this.state.incClans && (factionPool = [...factionPool, ...data.clans]);
		this.state.incInnerSphere && (factionPool = [...factionPool, ...data.factions]);

		newQuest.message = this.fetchRandomItem(data.messages.filter(msg => msg !== this.state.quest.message));

		if (roll <= 15) {
			newQuest.specialRequest = this.fetchRandomItem(data.specialRequests.filter(req => req !== this.state.quest.specialRequest));
		} else {
			newQuest.target = this.fetchRandomItem(factionPool.filter(trg => trg !== this.state.quest.target));
			newQuest.contract = this.fetchRandomItem(data.contracts.filter(cnt => cnt !== this.state.quest.contract));
		}

		this.setState({ quest: newQuest, tokens: this.state.tokens > 0 ? this.state.tokens-1 : 0 });
	}

	componentDidUpdate() {
		localStorage.setItem('RT-quest-giver-cache', JSON.stringify(this.state));
	}

	render() {
		const { quest, tokens, incClans, incInnerSphere } = this.state;
		return <main className='main-container'>

			<header>
				<h1>The Broker</h1>
				<div className='cent-box'></div>
				<div className='horiz-box'></div>
			</header>

			<p className='explanation'>
				You earn 1 token for ANY mission you successfuly complete. Contact the Broker by pressing the "CALL" button (this will cost 1 token), the Broker will then give you a task to complete.
				Perform the specified task and you will be able to claim a reward type from the table. A reward can be selected from any item in the game (from weapons to equipment to mech parts)
				you specify what you want and the Broker will acquire it for you... just don't ask how.
			</p>

			<div className='button-container'>
				<div className='tokens-container'>
					<p>Tokens:</p>
					<div className='qty-selector'>
						<button disabled={tokens < 1 ? true : false} onClick={() => this.setState({tokens: tokens > 0 ? tokens-1 : 0})}>
							<span>-</span>
						</button>
						<input 
							type='number'
							onChange={evt => this.setState({tokens: evt.target.value < 0 ? 0 : evt.target.value})}
							value={tokens}
						></input>
						<button onClick={() => this.setState({tokens: tokens+1})}>
							<span>+</span>
						</button>
					</div>
				</div>
				<button 
					disabled={(!incClans && !incInnerSphere) || !tokens ? true : false}
					onClick={() => this.generateQuest()}
				>
					Call
				</button>
				<div className='toggle-container'>
					<div 
						className='clans-toggle'
						onClick={() => this.setState({ incClans: !incClans })}
					>
						<div className='checkbox'>
							{incClans && <div></div>}
						</div>
						<p>Clans</p>
					</div>
					<div 
						className='inner-sphere-toggle'
						onClick={() => this.setState({ incInnerSphere: !incInnerSphere })}
					>
						<div className='checkbox'>
							{incInnerSphere && <div></div>}
						</div>
						<p>Inner Sphere Factions</p>
					</div>
				</div>
			</div>

			{quest.message && 
				<div className='message-container'>
					<p className='message'>{quest.message} - B</p>
					<div className='cent-box'></div>
					<div className='vert-box'></div>
					<div className='horiz-box'></div>
				</div>
			}
			
			{((quest.target && quest.contract) || quest.specialRequest) &&
				<div className='details-container' style={{ flexDirection: quest.specialRequest ? 'column' : 'row' }}>
					{quest.specialRequest &&
						<>
							<div>
								<div className='details'>
									<p><span>Tier:</span> {quest.specialRequest.tier}</p>
								</div>
								<div className='details'>
									<p><span>Request:</span> {quest.specialRequest.title}</p>
								</div>
							</div>
							<p className='special-request'>{quest.specialRequest.request}</p>
						</>
					}
					{quest.target && quest.contract &&
						<>
							<div className='details'>
								<p><span>Target:</span> {quest.target}</p>
							</div>
							<div className='details'>
								<p><span>Contract:</span> {quest.contract.type}</p>
								<div className='contract-colour' style={{ backgroundColor: quest.contract.colour }}></div>
							</div>
						</>
					}
					<div className='cent-box'></div>
					<div className='horiz-box'></div>
				</div>
			}

			<p className='explanation'>
				Below is the reward table, each row on the X axis represents a reward category and the columns on the Y axis represent the difficulty teir
				(Teir I includes missions of 3 skulls or higher, Teir II is 4 skulls or higher and Teir III is 5 skulls).
				When you complete a quest, you may select a reward from the table - note that you can only select your reward from one category at a time.
			</p>

			<div className='reward-reference-header'>
				<h2>Rewards Reference</h2>
			</div>

			<div className='reward-reference' style={{ gridTemplateRows: `1fr ${data.rewards.map(reward => '1fr').join(' ')}` }}>
				<div className='top-row'>
					<Row reward={{ title: '', teir1: 'Teir I', teir2: 'Teir II', teir3: 'Teir III' }} />
				</div>
				{data.rewards.length && data.rewards.map((reward, inx) => <Row key={inx} reward={reward} />)}
			</div>
			
		</main>
	}

}

export default App;

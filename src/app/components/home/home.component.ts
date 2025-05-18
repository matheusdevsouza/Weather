import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { WeatherService, WeatherData } from '../../services/weather.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  city: string = '';
  currentWeather: WeatherData | null = null;
  error: string = '';
  history: Array<{
    city: string;
    timestamp: Date;
    data: WeatherData;
  }> = [];

  constructor(private weatherService: WeatherService) {
    // Carregar histórico do localStorage
    const savedHistory = localStorage.getItem('weatherHistory');
    if (savedHistory) {
      this.history = JSON.parse(savedHistory);
    }
  }

  search(city?: string) {
    if (city) {
      this.city = city;
    }

    if (!this.city.trim()) {
      this.error = 'Por favor, digite o nome de uma cidade';
      return;
    }

    this.error = '';
    this.weatherService.getWeatherByCity(this.city).subscribe({
      next: (data) => {
        this.currentWeather = data;
        
        // Adicionar ao histórico
        const historyItem = {
          city: this.city,
          timestamp: new Date(),
          data: data
        };

        // Verificar se a cidade já existe no histórico
        const existingIndex = this.history.findIndex(item => item.city.toLowerCase() === this.city.toLowerCase());
        if (existingIndex !== -1) {
          this.history.splice(existingIndex, 1);
        }

        // Adicionar no início do array
        this.history.unshift(historyItem);

        // Manter apenas os últimos 5 itens
        if (this.history.length > 5) {
          this.history = this.history.slice(0, 5);
        }

        // Salvar no localStorage
        localStorage.setItem('weatherHistory', JSON.stringify(this.history));
      },
      error: (error) => {
        if (error.status === 404) {
          this.error = 'Cidade não encontrada. Verifique o nome e tente novamente.';
        } else {
          this.error = 'Erro ao buscar dados do clima. Tente novamente mais tarde.';
        }
        this.currentWeather = null;
      }
    });
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem('weatherHistory');
  }
}
